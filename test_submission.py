import requests
import json

# Test the code submission endpoint
def test_code_submission():
    url = "http://localhost:8000/submissions/"
    
    # Test data - simple submission
    submission_data = {
        "code": "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
        "language": "python",
        "problem_id": 1
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=submission_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Submission successful!")
            print(f"Status: {result.get('status')}")
            print(f"Test cases passed: {result.get('test_cases_passed')}")
            print(f"Total test cases: {result.get('total_test_cases')}")
            if result.get('test_case_results'):
                print("Test case results:")
                for i, tc in enumerate(result['test_case_results']):
                    print(f"  Test {i+1}: {'✅' if tc['passed'] else '❌'}")
                    if not tc['passed']:
                        print(f"    Expected: {tc['expected_output']}")
                        print(f"    Actual: {tc['actual_output']}")
        else:
            print("❌ Submission failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_code_submission()
