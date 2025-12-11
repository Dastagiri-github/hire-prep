from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, database, models, dependencies
import httpx
import asyncio

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"],
)

import sys
import subprocess
import tempfile
import os
import ast
import json
import re
from cpp_executor import execute_cpp_code
from java_executor import execute_java_code

# Mock Execution Function (Replace with actual API call)
async def execute_code(code: str, language: str, input_data: str):
    if language == "python":
        return execute_python_code(code, input_data)
    elif language == "cpp":
        return await execute_cpp_code(code, input_data)
    elif language == "java":
        return await execute_java_code(code, input_data)
    
    # Mock logic for other languages:
    if "error" in code:
        return {"output": "", "error": "Syntax Error"}
    
    # Simple mock for testing: assume the code just prints the input
    return {"output": input_data.strip(), "error": None}

def execute_python_code(code: str, input_data: str):
    # Parse function name and args
    try:
        tree = ast.parse(code)
        func_def = next((node for node in tree.body if isinstance(node, ast.FunctionDef)), None)
        if not func_def:
             # If no function, maybe it's a script? Just run it?
             # But we need to inject input.
             return {"output": "", "error": "No function definition found"}
             
        func_name = func_def.name
        args = [arg.arg for arg in func_def.args.args]
    except Exception as e:
        return {"output": "", "error": f"Parse Error: {str(e)}"}

    # Pre-process input data to handle comma-separated assignments
    # e.g. "nums = [1,2], target = 3" -> "nums = [1,2]\ntarget = 3"
    formatted_input = re.sub(r',\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=', r'\n\1 =', input_data)
    
    # Indent subsequent lines to match the try block indentation (4 spaces)
    indented_input = formatted_input.replace('\n', '\n    ')

    # Create footer
    footer = f"""
# --- Test Harness ---
import json
import sys

try:
    # Inject Input
    {indented_input}
    
    # Call Function
    # We assume the input_data sets variables matching the function arguments
    # or we pass the variables that were set.
    # Let's try to pass arguments by name if they exist in locals
    
    args_to_pass = []
    local_vars = locals()
    expected_args = {json.dumps(args)}
    
    for arg in expected_args:
        if arg in local_vars:
            args_to_pass.append(local_vars[arg])
        else:
            # Try to find a variable that looks like the arg?
            # Or just fail?
            pass
            
    if len(args_to_pass) != len(expected_args):
        # Fallback: if input_data set 'nums' and 'target', and args are 'nums', 'target', we are good.
        # If input_data set 's', and arg is 's', we are good.
        pass

    result = {func_name}(*args_to_pass)
    
    # Heuristic for in-place modifications (e.g. Reverse String)
    if result is None and len(args_to_pass) > 0 and isinstance(args_to_pass[0], list):
        print("###RESULT###")
        print(json.dumps(args_to_pass[0]))
    else:
        print("###RESULT###")
        print(json.dumps(result))
except Exception as e:
    print("###ERROR###")
    print(str(e))
"""
    full_code = code + "\n" + footer
    
    # Write to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(full_code)
        temp_path = f.name
    
    try:
        # Run
        result = subprocess.run([sys.executable, temp_path], capture_output=True, text=True, timeout=5)
        output = result.stdout
        
        if "###ERROR###" in output:
            error_msg = output.split("###ERROR###")[1].strip()
            return {"output": "", "error": error_msg}
        
        if "###RESULT###" in output:
            actual_output = output.split("###RESULT###")[1].strip()
            return {"output": actual_output, "error": None}
        
        if result.stderr:
             return {"output": "", "error": result.stderr}
             
        return {"output": output.strip(), "error": "No output returned"}

    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Time Limit Exceeded"}
    except Exception as e:
        return {"output": "", "error": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

@router.post("/", response_model=schemas.Submission)
async def submit_code(
    submission: schemas.SubmissionCreate, 
    current_user: models.User = Depends(dependencies.get_current_user), 
    db: Session = Depends(database.get_db)
):
    problem = crud.get_problem(db, problem_id=submission.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Execution Logic
    all_passed = True
    failure_details = {}
    actual_output = None
    expected_output = None
    
    test_cases = problem.hidden_test_cases
    if not test_cases:
        test_cases = problem.sample_test_cases

    for case in test_cases:
        input_val = case.get("input", "")
        expected_output = case.get("output", "").strip()
        
        # Mock execution
        # If the user code is exactly "solution", we pass it for demo purposes.
        if submission.code.strip() == "solution":
             actual_output = expected_output
        else:
             result = await execute_code(submission.code, submission.language, input_val)
             if result["error"]:
                all_passed = False
                failure_details = {
                    "actual_output": result["error"],
                    "expected_output": expected_output,
                    "message": f"Error at input: {input_val}"
                }
                break
             
             actual_output = result["output"].strip()

        # Normalize for comparison (handle JSON spacing differences and quote types)
        import json
        import ast

        # Parse Actual Output
        try:
            actual_obj = json.loads(actual_output)
        except:
            try:
                actual_obj = ast.literal_eval(actual_output)
            except:
                actual_obj = actual_output.strip()

        # Parse Expected Output
        try:
            expected_obj = json.loads(expected_output)
        except:
            try:
                expected_obj = ast.literal_eval(expected_output)
            except:
                expected_obj = expected_output.strip()

        # Compare
        try:
            is_match = (actual_obj == expected_obj)
        except:
            # Fallback to normalized string comparison if objects are not comparable
            is_match = (str(actual_output).replace(" ", "").replace("'", '"') == str(expected_output).replace(" ", "").replace("'", '"'))

        if not is_match:
            all_passed = False
            failure_details = {
                "actual_output": actual_output,
                "expected_output": expected_output,
                "message": f"Failed at input: {input_val}"
            }
            break
            
    status = "Accepted" if all_passed else "Wrong Answer"
    
    # Update User Stats
    stats = dict(current_user.stats)
    if status == "Accepted":
        # Check if user has already solved this problem to avoid double counting
        already_solved = db.query(models.Submission).filter(
            models.Submission.user_id == current_user.id,
            models.Submission.problem_id == submission.problem_id,
            models.Submission.status == "Accepted"
        ).first()

        if not already_solved:
            stats["totalSolved"] = stats.get("totalSolved", 0) + 1
            # Update topic stats
            for tag in problem.tags:
                if tag not in stats["topics"]:
                    stats["topics"][tag] = {"solved": 0, "accuracy": 0}
                stats["topics"][tag]["solved"] += 1
            
            current_user.stats = stats
            db.commit()

    db_submission = crud.create_submission(db=db, submission=submission, user_id=current_user.id, status=status, execution_time=0)
    
    response = schemas.Submission.from_orm(db_submission)
    if not all_passed:
        response.actual_output = failure_details.get("actual_output")
        response.expected_output = failure_details.get("expected_output")
        response.message = failure_details.get("message")
    elif actual_output is not None:
        response.actual_output = actual_output
        response.expected_output = expected_output
        response.message = "All test cases passed!"
        
    return response

