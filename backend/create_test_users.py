#!/usr/bin/env python3
"""
Create test users for HirePrep application
"""

import sys
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import models
import crud

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_users():
    """Create test users with different profiles"""
    
    # Create database session
    engine = database.engine
    SessionLocal = database.SessionLocal
    db = SessionLocal()
    
    try:
        # Test users with different skill levels and interests
        test_users = [
            {
                "username": "beginner_user",
                "email": "beginner@test.com",
                "name": "Alex Beginner",
                "password": "test123",
                "target_companies": ["Google", "Microsoft"],
                "stats": {
                    "totalSolved": 5,
                    "topics": {
                        "arrays": {"solved": 2, "accuracy": 0.6},
                        "strings": {"solved": 1, "accuracy": 0.5},
                        "linked-lists": {"solved": 2, "accuracy": 0.8}
                    }
                }
            },
            {
                "username": "intermediate_user", 
                "email": "intermediate@test.com",
                "name": "Sam Intermediate",
                "password": "test123",
                "target_companies": ["Amazon", "Facebook", "Apple"],
                "stats": {
                    "totalSolved": 25,
                    "topics": {
                        "arrays": {"solved": 8, "accuracy": 0.85},
                        "strings": {"solved": 5, "accuracy": 0.8},
                        "linked-lists": {"solved": 4, "accuracy": 0.75},
                        "trees": {"solved": 3, "accuracy": 0.6},
                        "dynamic-programming": {"solved": 2, "accuracy": 0.4},
                        "hashing": {"solved": 3, "accuracy": 0.9}
                    }
                }
            },
            {
                "username": "advanced_user",
                "email": "advanced@test.com", 
                "name": "Jordan Advanced",
                "password": "test123",
                "target_companies": ["Google", "Meta", "Netflix", "Stripe"],
                "stats": {
                    "totalSolved": 150,
                    "topics": {
                        "arrays": {"solved": 25, "accuracy": 0.95},
                        "strings": {"solved": 20, "accuracy": 0.9},
                        "linked-lists": {"solved": 15, "accuracy": 0.85},
                        "trees": {"solved": 18, "accuracy": 0.8},
                        "dynamic-programming": {"solved": 22, "accuracy": 0.75},
                        "hashing": {"solved": 12, "accuracy": 0.95},
                        "graphs": {"solved": 15, "accuracy": 0.7},
                        "backtracking": {"solved": 10, "accuracy": 0.8},
                        "greedy": {"solved": 8, "accuracy": 0.85},
                        "sorting": {"solved": 5, "accuracy": 0.98}
                    }
                }
            },
            {
                "username": "sql_focused",
                "email": "sql@test.com",
                "name": "Taylor SQL",
                "password": "test123", 
                "target_companies": ["Microsoft", "Amazon", "Oracle"],
                "stats": {
                    "totalSolved": 30,
                    "topics": {
                        "arrays": {"solved": 5, "accuracy": 0.7},
                        "sql-joins": {"solved": 10, "accuracy": 0.85},
                        "sql-aggregation": {"solved": 8, "accuracy": 0.9},
                        "sql-subqueries": {"solved": 7, "accuracy": 0.75}
                    }
                }
            },
            {
                "username": "company_prep",
                "email": "company@test.com",
                "name": "Morgan Company",
                "password": "test123",
                "target_companies": ["Google", "Amazon", "Meta", "Apple", "Microsoft"],
                "stats": {
                    "totalSolved": 80,
                    "topics": {
                        "arrays": {"solved": 15, "accuracy": 0.88},
                        "strings": {"solved": 12, "accuracy": 0.82},
                        "linked-lists": {"solved": 10, "accuracy": 0.78},
                        "trees": {"solved": 8, "accuracy": 0.65},
                        "dynamic-programming": {"solved": 6, "accuracy": 0.55},
                        "system-design": {"solved": 15, "accuracy": 0.7},
                        "algorithms": {"solved": 14, "accuracy": 0.85}
                    }
                }
            }
        ]
        
        created_users = []
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(models.User).filter(
                (models.User.username == user_data["username"]) | 
                (models.User.email == user_data["email"])
            ).first()
            
            if existing_user:
                print(f"⚠️  User {user_data['username']} already exists, skipping...")
                continue
            
            # Hash password
            hashed_password = pwd_context.hash(user_data["password"])
            
            # Create user
            db_user = models.User(
                username=user_data["username"],
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=hashed_password,
                target_companies=user_data["target_companies"],
                stats=user_data["stats"],
                reset_password=0  # Don't need to reset password
            )
            
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            created_users.append(db_user)
            print(f"✅ Created user: {user_data['username']} ({user_data['email']})")
        
        # Create some performance logs for testing ML recommendations
        print("\n📊 Creating performance logs for ML testing...")
        
        # Add some sample performance logs for the intermediate user
        intermediate_user = next((user for user in created_users if user.username == "intermediate_user"), None)
        if intermediate_user:
            sample_logs = [
                {
                    "problem_id": 1,
                    "problem_type": "coding",
                    "tags": ["arrays", "hashing"],
                    "difficulty": "Easy",
                    "status": "Accepted",
                    "attempt_number": 1,
                    "time_spent_seconds": 300
                },
                {
                    "problem_id": 2, 
                    "problem_type": "coding",
                    "tags": ["dynamic-programming"],
                    "difficulty": "Medium",
                    "status": "Wrong Answer",
                    "attempt_number": 2,
                    "time_spent_seconds": 600
                },
                {
                    "problem_id": 3,
                    "problem_type": "coding", 
                    "tags": ["strings"],
                    "difficulty": "Easy",
                    "status": "Accepted",
                    "attempt_number": 1,
                    "time_spent_seconds": 180
                },
                {
                    "problem_id": 4,
                    "problem_type": "coding",
                    "tags": ["trees"],
                    "difficulty": "Medium", 
                    "status": "Wrong Answer",
                    "attempt_number": 3,
                    "time_spent_seconds": 900
                },
                {
                    "problem_id": 5,
                    "problem_type": "sql",
                    "tags": ["sql-joins"],
                    "difficulty": "Medium",
                    "status": "Correct",
                    "attempt_number": 1,
                    "time_spent_seconds": 240
                }
            ]
            
            for log_data in sample_logs:
                perf_log = models.UserPerformanceLog(
                    user_id=intermediate_user.id,
                    **log_data
                )
                db.add(perf_log)
            
            db.commit()
            print(f"✅ Created {len(sample_logs)} performance logs for {intermediate_user.username}")
        
        print(f"\n🎉 Successfully created {len(created_users)} test users!")
        
        # Print login information
        print("\n📝 Test User Login Credentials:")
        print("=" * 50)
        for user in created_users:
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Password: test123")
            print(f"Name: {user.name}")
            print(f"Target Companies: {', '.join(user.target_companies)}")
            print(f"Problems Solved: {user.stats.get('totalSolved', 0)}")
            print("-" * 30)
        
        print(f"\n💡 Tips for testing:")
        print("1. Use 'intermediate_user' to test ML recommendations (has performance data)")
        print("2. Use 'advanced_user' to see recommendations for strong candidates")
        print("3. Use 'beginner_user' to see beginner-friendly recommendations")
        print("4. Use 'sql_focused' to test SQL problem recommendations")
        print("5. Use 'company_prep' to test company-specific recommendations")
        
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("👥 Creating Test Users for HirePrep")
    print("=" * 40)
    create_test_users()
