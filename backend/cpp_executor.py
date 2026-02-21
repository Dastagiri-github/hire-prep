import os
import shutil
import subprocess
import tempfile


def get_gpp_path():
    # Check system PATH
    system_gpp = shutil.which("g++")
    if system_gpp:
        return system_gpp

    # Check local portable installation relative to this file
    # This is safer than os.getcwd()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    local_gpp = os.path.join(base_dir, "tools", "w64devkit", "bin", "g++.exe")

    if os.path.exists(local_gpp):
        return local_gpp

    return None


async def execute_cpp_code(code: str, input_data: str):
    # Create a temp directory for the compilation
    with tempfile.TemporaryDirectory() as temp_dir:
        cpp_file_path = os.path.join(temp_dir, "solution.cpp")
        exe_file_path = os.path.join(
            temp_dir, "solution.exe" if os.name == "nt" else "solution"
        )

        # Write code to file
        with open(cpp_file_path, "w") as f:
            f.write(code)

        # Find compiler
        gpp_path = get_gpp_path()
        if not gpp_path:
            return {
                "output": "",
                "error": "g++ compiler not found. Please install MinGW or G++.",
            }

        # Prepare environment with compiler path
        # This is crucial for portable MinGW to find 'as', 'ld', etc.
        env = os.environ.copy()
        gpp_dir = os.path.dirname(gpp_path)
        env["PATH"] = gpp_dir + os.pathsep + env.get("PATH", "")

        # Compile
        try:
            compile_process = subprocess.run(
                [gpp_path, cpp_file_path, "-o", exe_file_path],
                capture_output=True,
                text=True,
                timeout=10,
                env=env,
            )

            if compile_process.returncode != 0:
                return {
                    "output": "",
                    "error": f"Compilation Error:\n{compile_process.stderr}",
                }

        except FileNotFoundError:
            return {
                "output": "",
                "error": "g++ compiler not found. Please install MinGW or G++.",
            }
        except Exception as e:
            return {"output": "", "error": f"Compilation failed: {str(e)}"}

        # Run the binary
        try:
            # Parse input to match the "Size Array Elements" format
            # This matches the logic used in Java executor to support "cin >> n"
            raw_input = parse_input_to_stdin_with_sizes(input_data)

            run_process = subprocess.run(
                [exe_file_path],
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
    import re

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
    processed_str = re.sub(r"\[(.*?)\]", replace_array, input_str)

    # Now clean up the rest (remove variable names, =, commas)
    clean_str = re.sub(r"[a-zA-Z_][a-zA-Z0-9_]*\s*=", " ", processed_str)
    clean_str = clean_str.replace(",", " ").replace('"', " ").replace("'", " ")

    # Collapse spaces
    return " ".join(clean_str.split())
