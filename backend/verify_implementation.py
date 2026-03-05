#!/usr/bin/env python3
"""
Verification script for Adaptive ML Recommendation Engine & Gemini API Integration
"""

import sys
import os
import requests
import json
from typing import Dict, Any

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend is not accessible: {e}")
        return False

def test_ml_recommendations():
    """Test ML recommendation endpoints"""
    base_url = "http://localhost:8000"
    
    # Test recommendations endpoint
    try:
        response = requests.get(f"{base_url}/recommendations/", timeout=10)
        if response.status_code == 401:
            print("✅ Recommendations endpoint requires authentication (expected)")
        elif response.status_code == 200:
            data = response.json()
            if "problems" in data and "reason" in data:
                print("✅ Recommendations endpoint working")
            else:
                print("❌ Recommendations endpoint returned unexpected format")
        else:
            print(f"❌ Recommendations endpoint returned {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not test recommendations: {e}")

def test_database_models():
    """Test if database models are properly defined"""
    try:
        from models import UserPerformanceLog, Problem, User
        print("✅ Database models imported successfully")
        
        # Check if UserPerformanceLog has required fields
        required_fields = ['user_id', 'problem_id', 'problem_type', 'tags', 'difficulty', 'status', 'attempt_number']
        for field in required_fields:
            if hasattr(UserPerformanceLog, field):
                print(f"✅ UserPerformanceLog has {field} field")
            else:
                print(f"❌ UserPerformanceLog missing {field} field")
                
    except ImportError as e:
        print(f"❌ Could not import models: {e}")

def test_services():
    """Test if services are properly defined"""
    try:
        from services.feature_engineering import build_user_profile
        from services.ml_recommender import get_recommendations, get_learning_path
        from services.similarity_engine import similarity_engine
        
        print("✅ All services imported successfully")
        
        # Test if functions exist
        functions_to_test = [
            (build_user_profile, 'build_user_profile'),
            (get_recommendations, 'get_recommendations'),
            (get_learning_path, 'get_learning_path'),
        ]
        
        for func, name in functions_to_test:
            if callable(func):
                print(f"✅ {name} is callable")
            else:
                print(f"❌ {name} is not callable")
                
        if hasattr(similarity_engine, 'get_similar_problems'):
            print("✅ similarity_engine has get_similar_problems method")
        else:
            print("❌ similarity_engine missing get_similar_problems method")
            
    except ImportError as e:
        print(f"❌ Could not import services: {e}")

def test_requirements():
    """Test if required packages are installed"""
    required_packages = [
        'scikit-learn',
        'numpy', 
        'pandas'
    ]
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is not installed")

def test_frontend_components():
    """Test if frontend components exist"""
    frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')
    
    components_to_check = [
        'components/SmartRecommendations.tsx'
    ]
    
    for component in components_to_check:
        component_path = os.path.join(frontend_path, component)
        if os.path.exists(component_path):
            print(f"✅ {component} exists")
        else:
            print(f"❌ {component} missing")

def main():
    """Run all verification tests"""
    print("🔍 Verifying Adaptive ML Recommendation Engine Implementation")
    print("=" * 60)
    
    # Test backend components
    print("\n📦 Testing Backend Components:")
    print("-" * 30)
    test_database_models()
    test_services()
    test_requirements()
    
    # Test API endpoints (if backend is running)
    print("\n🌐 Testing API Endpoints:")
    print("-" * 30)
    if test_backend_health():
        test_ml_recommendations()
    
    # Test frontend components
    print("\n🎨 Testing Frontend Components:")
    print("-" * 30)
    test_frontend_components()
    
    print("\n" + "=" * 60)
    print("✅ Verification complete!")
    print("\n📝 Next Steps:")
    print("1. Start the backend: cd backend && uvicorn main:app --reload")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Run database migrations if needed")
    print("4. Test the full application by logging in and solving problems")
    print("5. Check ML recommendations on the dashboard")

if __name__ == "__main__":
    main()
