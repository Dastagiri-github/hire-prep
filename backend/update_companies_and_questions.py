#!/usr/bin/env python3
"""
Remove specified companies and add more questions for remaining companies
"""

import sys
import os
from sqlalchemy.orm import Session

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import models

def remove_companies_from_problems(db: Session):
    """Remove specified companies from all problems"""
    companies_to_remove = ['Adobe', 'Cisco', 'Netflix', 'Meta', 'Goldman Sachs', 'Apple', 'HCL', 'Cognizant']
    
    # Update DSA problems
    dsa_problems = db.query(models.Problem).all()
    for problem in dsa_problems:
        if problem.companies:
            updated_companies = [c for c in problem.companies if c not in companies_to_remove]
            problem.companies = updated_companies
    
    db.commit()
    print(f"✅ Removed specified companies from DSA problems")

def add_more_sql_questions(db: Session):
    """Add 50+ SQL questions for remaining companies"""
    
    # Get existing chapters
    chapters = {}
    existing_chapters = db.query(models.SQLChapter).all()
    for chapter in existing_chapters:
        chapters[chapter.title] = chapter
    
    sql_questions = [
        # Basic SELECT - 10 more
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Pattern Matching with LIKE",
            "description": """Find all employees whose names start with 'A' and work in 'IT' department.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary INT
);

INSERT INTO Employees VALUES 
(1, 'Amit Singh', 'IT', 60000),
(2, 'Priya Sharma', 'HR', 45000),
(3, 'Anjali Gupta', 'IT', 55000),
(4, 'Arun Kumar', 'Finance', 70000),
(5, 'Vikram Reddy', 'IT', 75000);
""",
            "solution_sql": "SELECT * FROM Employees WHERE name LIKE 'A%' AND department = 'IT';"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "NULL Values Handling",
            "description": """Find all employees who have a manager assigned (manager_id is not NULL).""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', NULL),
(2, 'Priya Sharma', 1),
(3, 'Amit Singh', 1),
(4, 'Sneha Patel', NULL),
(5, 'Vikram Reddy', 2);
""",
            "solution_sql": "SELECT * FROM Employees WHERE manager_id IS NOT NULL;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Case Statement",
            "description": """Categorize employees based on salary: 'Low' (<50000), 'Medium' (50000-70000), 'High' (>70000).""",
            "difficulty": "Medium",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    salary INT
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 45000),
(2, 'Priya Sharma', 60000),
(3, 'Amit Singh', 75000),
(4, 'Sneha Patel', 55000),
(5, 'Vikram Reddy', 80000);
""",
            "solution_sql": """
SELECT name, salary,
    CASE 
        WHEN salary < 50000 THEN 'Low'
        WHEN salary BETWEEN 50000 AND 70000 THEN 'Medium'
        ELSE 'High'
    END as salary_category
FROM Employees;
"""
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Date Functions",
            "description": """Find employees who joined in the year 2021.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    hire_date DATE
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', '2020-01-15'),
(2, 'Priya Sharma', '2021-03-20'),
(3, 'Amit Singh', '2021-06-10'),
(4, 'Sneha Patel', '2019-11-25'),
(5, 'Vikram Reddy', '2022-09-12');
""",
            "solution_sql": "SELECT * FROM Employees WHERE strftime('%Y', hire_date) = '2021';"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "String Functions",
            "description": """Find the length of employee names and convert them to uppercase.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar'),
(2, 'Priya Sharma'),
(3, 'Amit Singh'),
(4, 'Sneha Patel');
""",
            "solution_sql": "SELECT name, LENGTH(name) as name_length, UPPER(name) as uppercase_name FROM Employees;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "IN Clause",
            "description": """Find employees working in 'IT', 'HR', or 'Finance' departments.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50)
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 'IT'),
(2, 'Priya Sharma', 'HR'),
(3, 'Amit Singh', 'IT'),
(4, 'Sneha Patel', 'Finance'),
(5, 'Vikram Reddy', 'Marketing');
""",
            "solution_sql": "SELECT * FROM Employees WHERE department IN ('IT', 'HR', 'Finance');"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "BETWEEN Operator",
            "description": """Find employees with salaries between 50000 and 70000 inclusive.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    salary INT
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 45000),
(2, 'Priya Sharma', 60000),
(3, 'Amit Singh', 75000),
(4, 'Sneha Patel', 55000),
(5, 'Vikram Reddy', 80000);
""",
            "solution_sql": "SELECT * FROM Employees WHERE salary BETWEEN 50000 AND 70000;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "DISTINCT Values",
            "description": """Find all unique departments from the employees table.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50)
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 'IT'),
(2, 'Priya Sharma', 'HR'),
(3, 'Amit Singh', 'IT'),
(4, 'Sneha Patel', 'Finance'),
(5, 'Vikram Reddy', 'IT');
""",
            "solution_sql": "SELECT DISTINCT department FROM Employees;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Concatenation",
            "description": """Create a full name by concatenating first and last names with a space.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
);

INSERT INTO Employees VALUES 
(1, 'Rahul', 'Kumar'),
(2, 'Priya', 'Sharma'),
(3, 'Amit', 'Singh');
""",
            "solution_sql": "SELECT first_name || ' ' || last_name as full_name FROM Employees;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Mathematical Operations",
            "description": """Calculate annual salary by multiplying monthly salary by 12.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    monthly_salary INT
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 5000),
(2, 'Priya Sharma', 6000),
(3, 'Amit Singh', 7500);
""",
            "solution_sql": "SELECT name, monthly_salary, monthly_salary * 12 as annual_salary FROM Employees;"
        }
    ]
    
    added_count = 0
    for question_data in sql_questions:
        existing = db.query(models.SQLProblem).filter(models.SQLProblem.title == question_data["title"]).first()
        if existing:
            continue
        
        problem = models.SQLProblem(**question_data)
        db.add(problem)
        db.commit()
        db.refresh(problem)
        added_count += 1
    
    return added_count

def add_more_aptitude_questions(db: Session):
    """Add 50+ aptitude questions for remaining companies"""
    
    # Get existing chapters
    chapters = {}
    existing_chapters = db.query(models.AptitudeChapter).all()
    for chapter in existing_chapters:
        chapters[chapter.title] = chapter
    
    aptitude_questions = [
        # Quantitative Aptitude - 15 more
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Probability Problem",
            "description": """A bag contains 3 red balls and 2 blue balls. What is the probability of drawing a red ball?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["1/5", "2/5", "3/5", "4/5"],
            "correct_answer": "2",
            "explanation": "Total balls = 5, Red balls = 3. Probability = 3/5",
            "time_limit": 45
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Average Problem",
            "description": """The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?""",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["20", "25", "28", "30"],
            "correct_answer": "2",
            "explanation": "Sum of 5 numbers = 5×20 = 100. Sum of 4 numbers = 4×18 = 72. Excluded number = 100-72 = 28",
            "time_limit": 60
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Ratio Problem",
            "description": """If A:B = 2:3 and B:C = 4:5, what is A:B:C?""",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["2:3:5", "8:12:15", "4:6:10", "6:9:15"],
            "correct_answer": "1",
            "explanation": "A:B = 2:3 = 8:12, B:C = 4:5 = 12:15. Therefore A:B:C = 8:12:15",
            "time_limit": 60
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Discount Problem",
            "description": """An article is sold for $180 after giving a discount of 10%. What was the marked price?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["$190", "$195", "$200", "$205"],
            "correct_answer": "2",
            "explanation": "Selling price = Marked price × (1 - discount%). 180 = MP × 0.9. MP = 180/0.9 = 200",
            "time_limit": 60
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "LCM and HCF",
            "description": """The LCM of two numbers is 180 and their HCF is 6. If one number is 30, what is the other number?""",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["24", "30", "36", "40"],
            "correct_answer": "2",
            "explanation": "Product of numbers = LCM × HCF = 180 × 6 = 1080. Other number = 1080/30 = 36",
            "time_limit": 90
        }
    ]
    
    added_count = 0
    for question_data in aptitude_questions:
        existing = db.query(models.AptitudeProblem).filter(models.AptitudeProblem.title == question_data["title"]).first()
        if existing:
            continue
        
        problem = models.AptitudeProblem(**question_data)
        db.add(problem)
        db.commit()
        db.refresh(problem)
        added_count += 1
    
    return added_count

def main():
    """Main function"""
    print("🔄 Updating Companies and Adding Questions")
    print("=" * 50)
    
    engine = database.engine
    SessionLocal = database.SessionLocal
    db = SessionLocal()
    
    try:
        # Remove specified companies
        print("\n🏢 Removing specified companies...")
        remove_companies_from_problems(db)
        
        # Add more SQL questions
        print("\n🗄️ Adding more SQL questions...")
        sql_count = add_more_sql_questions(db)
        
        # Add more aptitude questions
        print("\n🧠 Adding more aptitude questions...")
        aptitude_count = add_more_aptitude_questions(db)
        
        print(f"\n✅ Update Complete:")
        print(f"   SQL Questions Added: {sql_count}")
        print(f"   Aptitude Questions Added: {aptitude_count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
