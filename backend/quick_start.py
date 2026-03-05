#!/usr/bin/env python3
"""
Quick start script for HirePrep with ML recommendations
"""

import subprocess
import sys
import os
import time
import requests
from pathlib import Path

def check_backend_running():
    """Check if backend is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def check_frontend_running():
    """Check if frontend is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=2)
        return response.status_code == 200
    except:
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    try:
        # Change to backend directory
        backend_dir = Path(__file__).parent
        os.chdir(backend_dir)
        
        # Start uvicorn
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait for backend to start
        print("⏳ Waiting for backend to start...")
        for i in range(30):  # Wait up to 30 seconds
            if check_backend_running():
                print("✅ Backend started successfully!")
                return process
            time.sleep(1)
            print(f"   Trying... ({i+1}/30)")
        
        print("❌ Backend failed to start")
        process.terminate()
        return None
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def start_frontend():
    """Start the frontend server"""
    print("🎨 Starting frontend server...")
    try:
        # Change to frontend directory
        frontend_dir = Path(__file__).parent.parent / "frontend"
        os.chdir(frontend_dir)
        
        # Check if node_modules exists
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], check=True)
        
        # Start Next.js dev server
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait for frontend to start
        print("⏳ Waiting for frontend to start...")
        for i in range(60):  # Wait up to 60 seconds
            if check_frontend_running():
                print("✅ Frontend started successfully!")
                return process
            time.sleep(1)
            print(f"   Trying... ({i+1}/60)")
        
        print("❌ Frontend failed to start")
        process.terminate()
        return None
        
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return None

def print_test_info():
    """Print test user information and URLs"""
    print("\n" + "="*60)
    print("🎉 HirePrep is now running!")
    print("="*60)
    
    print("\n🌐 Access URLs:")
    print("   Frontend: http://localhost:3000")
    print("   Backend API: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    
    print("\n👥 Test User Accounts:")
    print("   All accounts use password: test123")
    print("\n   🟢 beginner_user")
    print("      Email: beginner@test.com")
    print("      Skill: Beginner (5 problems solved)")
    print("      Focus: Arrays, Strings, Linked Lists")
    
    print("\n   🟡 intermediate_user (BEST FOR TESTING)")
    print("      Email: intermediate@test.com") 
    print("      Skill: Intermediate (25 problems solved)")
    print("      Focus: Mixed topics with performance data")
    
    print("\n   🔴 advanced_user")
    print("      Email: advanced@test.com")
    print("      Skill: Advanced (150 problems solved)")
    print("      Focus: All topics including algorithms")
    
    print("\n   🔵 sql_focused")
    print("      Email: sql@test.com")
    print("      Skill: SQL-focused (30 problems solved)")
    print("      Focus: SQL and databases")
    
    print("\n   🟣 company_prep")
    print("      Email: company@test.com")
    print("      Skill: Company prep (80 problems solved)")
    print("      Focus: FAANG companies")
    
    print("\n🧪 Testing Guide:")
    print("   1. Login with 'intermediate_user' (has ML data)")
    print("   2. Check dashboard for ML recommendations")
    print("   3. Try a coding problem and check recommendations")
    print("   4. Submit wrong answer to see performance tracking")
    print("   5. Check learning path recommendations")
    
    print("\n📊 ML Features:")
    print("   • Personalized recommendations")
    print("   • Learning path generation")
    print("   • Similar problem suggestions")
    print("   • Weak area identification")
    
    print("\n⚠️  Important Notes:")
    print("   • Backend will auto-reload on code changes")
    print("   • Frontend will hot-reload on changes")
    print("   • Press Ctrl+C to stop servers")

def main():
    """Main function to start the application"""
    print("🚀 HirePrep Quick Start")
    print("=" * 30)
    
    # Check if backend is already running
    if check_backend_running():
        print("✅ Backend is already running")
        backend_process = None
    else:
        backend_process = start_backend()
    
    # Check if frontend is already running
    if check_frontend_running():
        print("✅ Frontend is already running")
        frontend_process = None
    else:
        frontend_process = start_frontend()
    
    if (backend_process is None and not check_backend_running()) or \
       (frontend_process is None and not check_frontend_running()):
        print("\n❌ Failed to start services")
        return
    
    # Print test information
    print_test_info()
    
    print("\n🛑 Press Ctrl+C to stop all servers...")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        print("✅ Servers stopped")

if __name__ == "__main__":
    main()
