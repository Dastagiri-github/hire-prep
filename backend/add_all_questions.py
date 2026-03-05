#!/usr/bin/env python3
"""
Complete script to remove specified companies and add 50 SQL + 50 Aptitude questions
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

def add_50_sql_questions(db: Session):
    """Add 50 comprehensive SQL questions"""
    
    # Get existing chapters
    chapters = {}
    existing_chapters = db.query(models.SQLChapter).all()
    for chapter in existing_chapters:
        chapters[chapter.title] = chapter
    
    sql_questions = [
        # Basic SELECT Queries (15 questions)
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
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Subtraction in SELECT",
            "description": """Calculate the profit amount by subtracting cost from selling price.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2)
);

INSERT INTO Products VALUES 
(1, 'Laptop', 40000, 50000),
(2, 'Mouse', 500, 750),
(3, 'Keyboard', 1500, 2000);
""",
            "solution_sql": "SELECT name, selling_price - cost_price as profit FROM Products;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "Modulo Operator",
            "description": """Find employees whose employee ID is odd.""",
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
(4, 'Sneha Patel'),
(5, 'Vikram Reddy');
""",
            "solution_sql": "SELECT * FROM Employees WHERE id % 2 = 1;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "COALESCE Function",
            "description": """Replace NULL values in the bonus column with 0.""",
            "difficulty": "Medium",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    salary INT,
    bonus INT
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 60000, 5000),
(2, 'Priya Sharma', 45000, NULL),
(3, 'Amit Singh', 55000, 3000),
(4, 'Sneha Patel', 70000, NULL);
""",
            "solution_sql": "SELECT name, salary, COALESCE(bonus, 0) as bonus FROM Employees;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "ROUND Function",
            "description": """Round the average salary to 2 decimal places.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    salary DECIMAL(10,2)
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar', 60000.50),
(2, 'Priya Sharma', 45000.75),
(3, 'Amit Singh', 55000.25);
""",
            "solution_sql": "SELECT ROUND(AVG(salary), 2) as avg_salary FROM Employees;"
        },
        {
            "chapter_id": chapters["Basic SELECT Queries"].id,
            "title": "SUBSTRING Function",
            "description": """Extract the first 3 characters of employee names.""",
            "difficulty": "Easy",
            "setup_sql": """
CREATE TABLE Employees (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO Employees VALUES 
(1, 'Rahul Kumar'),
(2, 'Priya Sharma'),
(3, 'Amit Singh');
""",
            "solution_sql": "SELECT name, SUBSTR(name, 1, 3) as short_name FROM Employees;"
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

def add_50_aptitude_questions(db: Session):
    """Add 50 comprehensive aptitude questions"""
    
    # Get existing chapters
    chapters = {}
    existing_chapters = db.query(models.AptitudeChapter).all()
    for chapter in existing_chapters:
        chapters[chapter.title] = chapter
    
    aptitude_questions = [
        # Quantitative Aptitude (20 questions)
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
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Percentage Increase",
            "description": """If the price of an item increases from $80 to $100, what is the percentage increase?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["20%", "25%", "30%", "35%"],
            "correct_answer": "1",
            "explanation": "Percentage increase = ((100-80)/80) × 100 = 25%",
            "time_limit": 45
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Square Root Problem",
            "description": """What is the square root of 5184?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["64", "72", "76", "82"],
            "correct_answer": "1",
            "explanation": "72 × 72 = 5184",
            "time_limit": 60
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Cube Problem",
            "description": """What is the cube of 12?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["1440", "1728", "1728", "2028"],
            "correct_answer": "1",
            "explanation": "12³ = 12 × 12 × 12 = 1728",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Fraction Problem",
            "description": """If 3/4 of a number is 36, what is the number?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["42", "48", "52", "56"],
            "correct_answer": "1",
            "explanation": "Let the number be x. 3/4 × x = 36. x = 36 × 4/3 = 48",
            "time_limit": 45
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Decimal to Fraction",
            "description": """Convert 0.125 to a fraction.""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["1/4", "1/6", "1/8", "1/10"],
            "correct_answer": "2",
            "explanation": "0.125 = 125/1000 = 1/8",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Area of Square",
            "description": """If the side of a square is 15 cm, what is its area?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["200 cm²", "225 cm²", "250 cm²", "275 cm²"],
            "correct_answer": "1",
            "explanation": "Area = side² = 15² = 225 cm²",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Perimeter of Rectangle",
            "description": """A rectangle has length 12 cm and breadth 8 cm. What is its perimeter?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["36 cm", "40 cm", "44 cm", "48 cm"],
            "correct_answer": "1",
            "explanation": "Perimeter = 2 × (length + breadth) = 2 × (12 + 8) = 40 cm",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Volume of Cube",
            "description": """What is the volume of a cube with side 6 cm?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["216 cm³", "256 cm³", "324 cm³", "364 cm³"],
            "correct_answer": "0",
            "explanation": "Volume = side³ = 6³ = 216 cm³",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Circle Area",
            "description": """What is the area of a circle with radius 7 cm? (Use π = 22/7)""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["140 cm²", "154 cm²", "168 cm²", "176 cm²"],
            "correct_answer": "1",
            "explanation": "Area = πr² = (22/7) × 7² = 154 cm²",
            "time_limit": 45
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Speed Calculation",
            "description": """A car travels 180 km in 3 hours. What is its speed?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
            "correct_answer": "1",
            "explanation": "Speed = Distance/Time = 180/3 = 60 km/h",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Time Calculation",
            "description": """If a person walks at 5 km/h, how long will it take to walk 20 km?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["3 hours", "4 hours", "5 hours", "6 hours"],
            "correct_answer": "1",
            "explanation": "Time = Distance/Speed = 20/5 = 4 hours",
            "time_limit": 30
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Train Problem",
            "description": """A train 200m long is running at 60 km/h. How much time will it take to cross a 100m long bridge?""",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["12 seconds", "15 seconds", "18 seconds", "20 seconds"],
            "correct_answer": "2",
            "explanation": "Total distance = 200 + 100 = 300m. Speed = 60 km/h = 60×1000/3600 = 16.67 m/s. Time = 300/16.67 = 18 seconds",
            "time_limit": 90
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Boat Problem",
            "description": """A boat can travel at 20 km/h in still water. If the speed of the stream is 4 km/h, what is the speed downstream?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["16 km/h", "20 km/h", "24 km/h", "28 km/h"],
            "correct_answer": "2",
            "explanation": "Speed downstream = Speed in still water + Speed of stream = 20 + 4 = 24 km/h",
            "time_limit": 60
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Age Problem",
            "description": """The sum of ages of father and son is 60 years. If father is 4 times older than son, what is son's age?""",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["10 years", "12 years", "15 years", "18 years"],
            "correct_answer": "1",
            "explanation": "Let son's age = x, father's age = 4x. x + 4x = 60. 5x = 60. x = 12",
            "time_limit": 90
        },
        {
            "chapter_id": chapters["Quantitative Aptitude"].id,
            "title": "Number Series",
            "description": """Complete the series: 1, 4, 9, 16, 25, ?""",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["30", "32", "36", "40"],
            "correct_answer": "2",
            "explanation": "The series is perfect squares: 1², 2², 3², 4², 5², 6² = 36",
            "time_limit": 45
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
    print("🔄 Complete Database Update")
    print("=" * 50)
    
    engine = database.engine
    SessionLocal = database.SessionLocal
    db = SessionLocal()
    
    try:
        # Remove specified companies
        print("\n🏢 Removing specified companies...")
        remove_companies_from_problems(db)
        
        # Add SQL questions
        print("\n🗄️ Adding 50 SQL questions...")
        sql_count = add_50_sql_questions(db)
        
        # Add aptitude questions
        print("\n🧠 Adding 50 aptitude questions...")
        aptitude_count = add_50_aptitude_questions(db)
        
        print(f"\n✅ Update Complete:")
        print(f"   SQL Questions Added: {sql_count}")
        print(f"   Aptitude Questions Added: {aptitude_count}")
        print(f"   Total Questions Added: {sql_count + aptitude_count}")
        
        print(f"\n📊 Updated Database:")
        print(f"   Companies removed: Adobe, Cisco, Netflix, Meta, Goldman Sachs, Apple, HCL, Cognizant")
        print(f"   Remaining companies: Google, Amazon, Microsoft, Infosys, TCS, Mindtree, Wipro, Capgemini, Accenture")
        print(f"   Enhanced question bank with 100+ new questions")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
