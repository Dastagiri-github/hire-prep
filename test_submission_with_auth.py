import requests
import json

# Test the code submission endpoint with proper authentication
def test_code_submission():
    base_url = "http://localhost:8000"
    
    # Login with intermediate_user
    login_data = {
        "username": "intermediate_user",
        "password": "test123"
    }
    
    try:
        # Login to get token
        response = requests.post(f"{base_url}/auth/login", data=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Access token obtained")
            
            # Now test code submission
            submission_data = {
                "code": "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
                "language": "python",
                "problem_id": 1
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            response = requests.post(f"{base_url}/submissions/", json=submission_data, headers=headers)
            print(f"\nSubmission Status: {response.status_code}")
            
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
                return True
            else:
                print(f"❌ Submission failed: {response.text}")
                return False
        else:
            print(f"❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_code_submission()
    if success:
        print("\n🎉 Code submission system is working correctly!")
    else:
        print("\n❌ Code submission system needs fixes.")
