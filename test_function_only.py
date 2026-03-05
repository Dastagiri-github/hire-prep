# Test the function-only solution with the new execution system
import subprocess
import sys

def test_function_only():
    # Read the function-only code
    with open('two_sum_function_only.py', 'r') as f:
        user_code = f.read()
    
    # Test cases from database
    test_cases = [
        "nums = [2,7,11,15], target = 9",
        "nums = [3,2,4], target = 6"
    ]
    
    expected_outputs = [
        "[0, 1]",
        "[1, 2]"
    ]
    
    # Create the test harness (similar to what the backend does)
    test_harness = '''
import sys
import json
import re
from typing import List, Any

# Read input from stdin
input_data = sys.stdin.read().strip()

# Enhanced input parsing for Two Sum format
def parse_input(input_str):
    # Try regex parsing first (for "nums = [2,7,11,15], target = 9" format)
    nums_match = re.search(r'nums\\s*=\\s*\\[(.*?)\\]', input_str)
    target_match = re.search(r'target\\s*=\\s*(\\d+)', input_str)
    
    if nums_match and target_match:
        # Extract numbers
        nums_str = nums_match.group(1)
        nums = [int(x.strip()) for x in nums_str.split(',') if x.strip()]
        target = int(target_match.group(1))
        return [nums, target]
    
    # Try JSON parsing
    try:
        parsed = json.loads(input_str)
        if isinstance(parsed, dict):
            if 'nums' in parsed and 'target' in parsed:
                return [parsed['nums'], parsed['target']]
        elif isinstance(parsed, list):
            return parsed
        else:
            return [parsed]
    except:
        pass
    
    # Fallback: treat as raw input
    return [input_data]

# Parse the input
args = parse_input(input_data)

# Call the solution function
try:
    result = two_sum(*args)
    # Print result in expected format
    if isinstance(result, (list, dict)):
        print(json.dumps(result))
    else:
        print(result)
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
'''
    
    # Combine user code with test harness
    full_code = user_code + '\n' + test_harness
    
    for i, (test_input, expected) in enumerate(zip(test_cases, expected_outputs)):
        print(f"Test Case {i+1}:")
        print(f"Input: {test_input}")
        print(f"Expected: {expected}")
        
        try:
            # Run the combined code
            result = subprocess.run(
                [sys.executable, '-c', full_code], 
                input=test_input, 
                capture_output=True, 
                text=True,
                timeout=5
            )
            
            actual_output = result.stdout.strip()
            print(f"Actual: {actual_output}")
            
            if actual_output == expected:
                print("✅ PASSED")
            else:
                print("❌ FAILED")
                if result.stderr:
                    print(f"Error: {result.stderr}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_function_only()
