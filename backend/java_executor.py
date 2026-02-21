import os
import re
import subprocess
import tempfile


async def execute_java_code(code: str, input_data: str):
    # Create a temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        # Java file must match the class name.
        # We assume the user uses "public class Solution" or just "class Solution"
        # If they use "public class Main", we name it Main.java

        class_name = "Solution"
        if "public class Main" in code:
            class_name = "Main"
        elif "class Main" in code:
            class_name = "Main"

        java_file_path = os.path.join(temp_dir, f"{class_name}.java")

        # Write code to file
        with open(java_file_path, "w") as f:
            f.write(code)

        # Compile
        try:
            compile_process = subprocess.run(
                ["javac", java_file_path], capture_output=True, text=True, timeout=10
            )

            if compile_process.returncode != 0:
                return {
                    "output": "",
                    "error": f"Compilation Error:\n{compile_process.stderr}",
                }

        except FileNotFoundError:
            return {
                "output": "",
                "error": "Java compiler (javac) not found. Please install JDK.",
            }
        except Exception as e:
            return {"output": "", "error": f"Compilation failed: {str(e)}"}

        # Run
        try:
            # Parse input to match the "Size Array Elements" format
            raw_input = parse_input_to_stdin_with_sizes(input_data)

            run_process = subprocess.run(
                ["java", "-cp", temp_dir, class_name],
                input=raw_input,
                capture_output=True,
                text=True,
                timeout=2,
            )

            if run_process.returncode != 0:
                return {"output": "", "error": f"Runtime Error:\n{run_process.stderr}"}

            return {"output": run_process.stdout.strip(), "error": None}

        except subprocess.TimeoutExpired:
            return {"output": "", "error": "Time Limit Exceeded"}
        except Exception as e:
            return {"output": "", "error": f"Execution Error: {str(e)}"}


def parse_input_to_stdin_with_sizes(input_str: str) -> str:
    """
    Converts 'nums = [2,7,11,15], target = 9' to '4 2 7 11 15 9'
    Prepends array size before array elements.
    """

    # Helper to process arrays
    def replace_array(match):
        content = match.group(1)
        # Split by comma, ignore whitespace/quotes
        elements = [
            e.strip().strip("'").strip('"') for e in content.split(",") if e.strip()
        ]
        size = len(elements)
        return f"{size} {' '.join(elements)}"

    # Find arrays: [ ... ]
    # We use a regex that captures content inside []
    # This is a simple parser, might fail on nested arrays or strings containing ]
    processed_str = re.sub(r"\[(.*?)\]", replace_array, input_str)

    # Now clean up the rest (remove variable names, =, commas)
    clean_str = re.sub(r"[a-zA-Z_][a-zA-Z0-9_]*\s*=", " ", processed_str)
    clean_str = clean_str.replace(",", " ").replace('"', " ").replace("'", " ")

    # Collapse spaces
    return " ".join(clean_str.split())
