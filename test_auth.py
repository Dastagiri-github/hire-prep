import requests
import json

# Test user registration and login
def test_auth():
    base_url = "http://localhost:8000"
    
    # Register a test user
    register_data = {
        "username": "testuser",
        "email": "test@example.com",
        "name": "Test User",
        "dob": "1995-06-15"
    }
    
    try:
        # Try to register
        response = requests.post(f"{base_url}/auth/register", json=register_data)
        print(f"Register Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ User registered successfully")
        else:
            print(f"Register response: {response.text}")
        
        # Login to get token
        login_data = {
            "username": "testuser",
            "password": "testpassword"  # This might need to be adjusted
        }
        
        response = requests.post(f"{base_url}/auth/login", data=login_data)
        print(f"Login Status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Access token obtained: {access_token[:20]}...")
            return access_token
        else:
            print("❌ Login failed")
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    token = test_auth()
    if token:
        print(f"Token for testing: {token}")
