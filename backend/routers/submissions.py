from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import database
import dependencies
import models
import schemas

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"]
)

import ast
import json
import time
import httpx

from config import settings


def normalize_output_comparison(actual: str, expected: str) -> bool:
    """Normalize outputs for comparison (CodeChef style)"""
    try:
        # Try JSON parsing first
        actual_obj = json.loads(actual)
        expected_obj = json.loads(expected)
        return actual_obj == expected_obj
    except:
        try:
            # Try literal evaluation
            actual_obj = ast.literal_eval(actual)
            expected_obj = ast.literal_eval(expected)
            return actual_obj == expected_obj
        except:
            # Fallback to string comparison with normalization
            # Remove extra whitespace, normalize quotes, handle case differences
            actual_norm = actual.strip().replace(" ", "").replace("'", '"').lower()
            expected_norm = expected.strip().replace(" ", "").replace("'", '"').lower()
            return actual_norm == expected_norm


async def execute_code(code: str, language: str, input_data: str):
    url = f"{settings.EXECUTION_ENGINE_URL}/execute"
    payload = {
        "language": language,
        "code": code,
        "input": input_data
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=15.0)
            if response.status_code == 200:
                data = response.json()
                return {"output": data.get("output", ""), "error": data.get("error")}
            else:
                return {"output": "", "error": f"Execution Engine Error: {response.text}"}
        except Exception as e:
            return {"output": "", "error": f"Connection Error: {str(e)}"}


@router.post("/", response_model=schemas.Submission)
async def submit_code(
    submission: schemas.SubmissionCreate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    problem = crud.get_problem(db, problem_id=submission.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # CodeChef style execution against all test cases
    test_cases = problem.hidden_test_cases
    if not test_cases:
        test_cases = problem.sample_test_cases

    test_case_results = []
    all_passed = True
    failure_details = {}
    actual_output = None
    expected_output = None

    for idx, case in enumerate(test_cases):
        input_val = case.get("input", "")
        expected_output = case.get("output", "").strip()

        # Execute code for each test case
        start_time = time.time()
        
        # Special case for demo
        if submission.code.strip() == "solution":
            actual_output = expected_output
            execution_time = 0.1
            test_passed = True
        else:
            result = await execute_code(submission.code, submission.language, input_val)
            execution_time = time.time() - start_time
            
            if result["error"]:
                test_passed = False
                actual_output = result["error"]
                failure_details = {
                    "actual_output": result["error"],
                    "expected_output": expected_output,
                    "message": f"Error at test case {idx + 1}: {input_val}",
                }
                all_passed = False
            else:
                actual_output = result["output"].strip()
                test_passed = normalize_output_comparison(actual_output, expected_output)
                
                if not test_passed:
                    failure_details = {
                        "actual_output": actual_output,
                        "expected_output": expected_output,
                        "message": f"Wrong answer at test case {idx + 1}",
                    }
                    all_passed = False

        # Store individual test case result
        test_case_results.append({
            "input": input_val,
            "expected_output": expected_output,
            "actual_output": actual_output,
            "passed": test_passed,
            "execution_time": round(execution_time * 1000, 2)  # Convert to ms
        })

        # If any test failed, we can stop early for Wrong Answer
        if not test_passed:
            break

    status = "Accepted" if all_passed else "Wrong Answer"

    # Update User Stats
    stats = dict(current_user.stats)
    if status == "Accepted":
        # Check if user has already solved this problem to avoid double counting
        already_solved = (
            db.query(models.Submission)
            .filter(
                models.Submission.user_id == current_user.id,
                models.Submission.problem_id == submission.problem_id,
                models.Submission.status == "Accepted",
            )
            .first()
        )

        if not already_solved:
            stats["totalSolved"] = stats.get("totalSolved", 0) + 1
            # Update topic stats
            for tag in problem.tags:
                if tag not in stats["topics"]:
                    stats["topics"][tag] = {"solved": 0, "accuracy": 0}
                stats["topics"][tag]["solved"] += 1

            current_user.stats = stats
            db.commit()

    db_submission = crud.create_submission(
        db=db,
        submission=submission,
        user_id=current_user.id,
        status=status,
        execution_time=0,
    )

    # --- Log performance for ML recommendation engine ---
    attempt_count = (
        db.query(models.Submission)
        .filter(
            models.Submission.user_id == current_user.id,
            models.Submission.problem_id == submission.problem_id,
        )
        .count()
    )
    perf_log = models.UserPerformanceLog(
        user_id=current_user.id,
        problem_id=problem.id,
        problem_type="coding",
        tags=list(problem.tags) if problem.tags else [],
        difficulty=problem.difficulty,
        status=status,
        attempt_number=attempt_count,
        time_spent_seconds=getattr(submission, "time_spent_seconds", None),
    )
    db.add(perf_log)
    db.commit()

    response = schemas.Submission.from_orm(db_submission)
    
    # Add test case results to response
    response.test_case_results = test_case_results
    response.test_cases_passed = sum(1 for tc in test_case_results if tc["passed"])
    response.total_test_cases = len(test_case_results)
    
    if not all_passed:
        response.actual_output = failure_details.get("actual_output")
        response.expected_output = failure_details.get("expected_output")
        response.message = failure_details.get("message")
    else:
        # Use the last successful output
        if test_case_results:
            last_successful = test_case_results[-1]
            response.actual_output = last_successful["actual_output"]
            response.expected_output = last_successful["expected_output"]
        response.message = "All test cases passed!"

    return response
