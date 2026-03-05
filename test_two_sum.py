# Test the Two Sum solution
import subprocess
import sys

def test_two_sum():
    # Test cases that match the expected format
    test_cases = [
        "nums = [2,7,11,15], target = 9",
        "nums = [3,2,4], target = 6",
        "nums = [3,3], target = 6"
    ]
    
    expected_outputs = [
        "[0, 1]",
        "[1, 2]", 
        "[0, 1]"
    ]
    
    for i, (test_input, expected) in enumerate(zip(test_cases, expected_outputs)):
        print(f"Test Case {i+1}:")
        print(f"Input: {test_input}")
        print(f"Expected: {expected}")
        
        try:
            # Run the solution
            result = subprocess.run(
                [sys.executable, "two_sum_solution.py"], 
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
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_two_sum()
