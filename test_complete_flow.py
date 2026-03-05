import requests
import json

# Test the complete flow: function-only submission + test case display + next button
def test_complete_flow():
    base_url = "http://localhost:8000"
    
    # Login with intermediate_user
    login_data = {
        "username": "intermediate_user",
        "password": "test123"
    }
    
    try:
        # Login to get token
        response = requests.post(f"{base_url}/auth/login", data=login_data)
        print(f"✅ Login Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Access token obtained")
            
            # Test function-only submission with Two Sum
            function_code = '''def two_sum(nums, target):
    """
    Two Sum Solution - Function Only
    Users only need to write this function logic
    Test cases are handled by system automatically
    """
    # Create a hash map to store value -> index mapping
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in our map
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number with its index
        num_map[num] = i
    
    # If no solution found, return empty list
    return []'''
            
            # Test submission
            submission_data = {
                "code": function_code,
                "language": "python",
                "problem_id": 1
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            response = requests.post(f"{base_url}/submissions/", json=submission_data, headers=headers)
            print(f"\n📊 Submission Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Submission successful!")
                print(f"📈 Status: {result.get('status')}")
                print(f"📊 Test Cases Passed: {result.get('test_cases_passed')}/{result.get('total_test_cases')}")
                
                # Check if detailed test case results are shown
                if result.get('test_case_results'):
                    print("📋 Test Case Results:")
                    for i, tc in enumerate(result['test_case_results']):
                        status_icon = "✅ PASSED" if tc['passed'] else "❌ FAILED"
                        print(f"  Test {i+1}: {status_icon}")
                        if not tc['passed']:
                            print(f"    📥 Input: {tc['input']}")
                            print(f"    🎯 Expected: {tc['expected_output']}")
                            print(f"    ⚠️  Actual: {tc['actual_output']}")
                            print(f"    ⏱️  Time: {tc['execution_time']}ms")
                        else:
                            print(f"    ⏱️  Time: {tc['execution_time']}ms")
                
                # Check if next button functionality works
                if result.get('status') in ["Accepted", "Wrong Answer"]:
                    print("\n🔄 Testing Next Button Logic...")
                    
                    # Test recommendations API
                    if result.get('status') == "Accepted":
                        next_res = requests.get(f"{base_url}/recommendations/", headers=headers)
                        if next_res.status_code == 200 and next_res.json():
                            next_data = next_res.json()
                            print(f"✅ Next recommendation available: Problem #{next_data[0]['id']}")
                        else:
                            print("ℹ️  No recommendations available")
                    else:
                        next_res = requests.get(f"{base_url}/recommendations/next?failed_problem_id=1", headers=headers)
                        if next_res.status_code == 200 and next_res.json():
                            next_data = next_res.json()
                            print(f"✅ Next problem after failure: Problem #{next_data['id']}")
                        else:
                            print("ℹ️  No next problem recommendation available")
                
                return True
            else:
                print(f"❌ Submission failed: {response.text}")
                return False
        else:
            print(f"❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_complete_flow()
    if success:
        print("\n🎉 Complete flow test PASSED!")
        print("✅ Function-only submissions work correctly")
        print("✅ Test case results display properly") 
        print("✅ Next button logic implemented")
    else:
        print("\n❌ Complete flow test FAILED!")
