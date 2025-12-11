import logging
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------------------------------------------------------
# CHAPTER 1: HR & Employee Management
# -----------------------------------------------------------------------------
HR_SETUP_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER,
    manager_id INTEGER,
    hire_date DATE,
    FOREIGN KEY (department_id) REFERENCES Departments(id),
    FOREIGN KEY (manager_id) REFERENCES Employees(id)
);

CREATE TABLE IF NOT EXISTS Salaries (
    employee_id INTEGER,
    salary INTEGER,
    effective_date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employees(id)
);

-- Seed Data
INSERT INTO Departments (id, name) VALUES (1, 'Engineering'), (2, 'HR'), (3, 'Sales'), (4, 'Marketing');

INSERT INTO Employees (id, name, department_id, manager_id, hire_date) VALUES 
(1, 'Alice', 1, NULL, '2020-01-15'),
(2, 'Bob', 1, 1, '2020-02-20'),
(3, 'Charlie', 2, NULL, '2019-05-01'),
(4, 'David', 3, NULL, '2021-03-10'),
(5, 'Eve', 1, 1, '2022-01-05'),
(6, 'Frank', 3, 4, '2021-06-15'),
(7, 'Grace', 4, NULL, '2023-01-10'),
(8, 'Hank', 1, 2, '2023-02-01');

INSERT INTO Salaries (employee_id, salary, effective_date) VALUES
(1, 120000, '2020-01-15'),
(1, 130000, '2021-01-15'),
(2, 90000, '2020-02-20'),
(2, 95000, '2021-02-20'),
(3, 80000, '2019-05-01'),
(4, 100000, '2021-03-10'),
(5, 85000, '2022-01-05'),
(6, 70000, '2021-06-15'),
(7, 95000, '2023-01-10'),
(8, 88000, '2023-02-01');
"""

HR_PROBLEMS = [
    {
        "title": "List All Employees",
        "description": "Select all columns from the `Employees` table.\n\nSchema `Employees`: (id, name, department_id, manager_id, hire_date)",
        "difficulty": "Easy",
        "solution_sql": "SELECT * FROM Employees;"
    },
    {
        "title": "Employees in Engineering",
        "description": "Find the names of all employees who work in the 'Engineering' department (id=1) from the `Employees` table.\n\nSchema `Employees`: (id, name, department_id, manager_id, hire_date)",
        "difficulty": "Easy",
        "solution_sql": "SELECT name FROM Employees WHERE department_id = 1;"
    },
    {
        "title": "High Earners",
        "description": "Find the **unique** `employee_id`s of employees who have ever had a salary greater than 100,000 from the `Salaries` table.\n\nSchema `Salaries`: (employee_id, salary, effective_date)",
        "difficulty": "Easy",
        "solution_sql": "SELECT DISTINCT employee_id FROM Salaries WHERE salary > 100000;"
    },
    {
        "title": "Count Employees per Department",
        "description": "Return the `department_id` and the number of employees in each department from the `Employees` table.\n\nSchema `Employees`: (id, name, department_id, manager_id, hire_date)",
        "difficulty": "Easy",
        "solution_sql": "SELECT department_id, COUNT(*) FROM Employees GROUP BY department_id;"
    },
    {
        "title": "Join Employees and Departments",
        "description": "List employee names alongside their department names. Use `Employees` and `Departments` tables.\n\nSchema `Employees`: (id, name, department_id, manager_id, hire_date)\nSchema `Departments`: (id, name)",
        "difficulty": "Medium",
        "solution_sql": "SELECT E.name, D.name FROM Employees E JOIN Departments D ON E.department_id = D.id;"
    },
    {
        "title": "Current Salary",
        "description": "Find the most recent salary for each employee from the `Salaries` table. Use `effective_date` to find the latest entry. Return `employee_id` and `salary`.",
        "difficulty": "Medium",
        "solution_sql": "SELECT employee_id, salary FROM Salaries S1 WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id);"
    },
    {
        "title": "Managers Only",
        "description": "Find the names of employees who are also managers. Use the `Employees` table (self-join on `manager_id`).",
        "difficulty": "Medium",
        "solution_sql": "SELECT DISTINCT M.name FROM Employees E JOIN Employees M ON E.manager_id = M.id;"
    },
    {
        "title": "Employees Hired in 2021",
        "description": "List names of employees hired in the year 2021 from the `Employees` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT name FROM Employees WHERE strftime('%Y', hire_date) = '2021';"
    },
    {
        "title": "Department Salary Budget",
        "description": "Calculate the total current salary expenditure for each department. Use `Employees`, `Departments`, and `Salaries` tables.",
        "difficulty": "Medium",
        "solution_sql": """
        WITH CurrentSalaries AS (
            SELECT employee_id, salary 
            FROM Salaries S1 
            WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id)
        )
        SELECT D.name, SUM(CS.salary) 
        FROM Employees E 
        JOIN CurrentSalaries CS ON E.id = CS.employee_id 
        JOIN Departments D ON E.department_id = D.id 
        GROUP BY D.name;
        """
    },
    {
        "title": "Employees Earning More Than Managers",
        "description": "Find employees who earn more than their direct manager (compare current salaries). Use `Employees` and `Salaries` tables.",
        "difficulty": "Hard",
        "solution_sql": """
        WITH CurrentSalaries AS (
            SELECT employee_id, salary 
            FROM Salaries S1 
            WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id)
        )
        SELECT E.name 
        FROM Employees E
        JOIN CurrentSalaries ES ON E.id = ES.employee_id
        JOIN Employees M ON E.manager_id = M.id
        JOIN CurrentSalaries MS ON M.id = MS.employee_id
        WHERE ES.salary > MS.salary;
        """
    },
    {
        "title": "Second Highest Salary",
        "description": "Find the second highest current salary across all employees from the `Salaries` table.",
        "difficulty": "Medium",
        "solution_sql": """
        WITH CurrentSalaries AS (
            SELECT salary FROM Salaries S1 
            WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id)
        )
        SELECT MAX(salary) FROM CurrentSalaries WHERE salary < (SELECT MAX(salary) FROM CurrentSalaries);
        """
    },
    {
        "title": "Department Top Earner",
        "description": "Find the employee with the highest current salary in each department. Use `Employees` and `Salaries` tables.",
        "difficulty": "Hard",
        "solution_sql": """
        WITH CurrentSalaries AS (
            SELECT employee_id, salary 
            FROM Salaries S1 
            WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id)
        ),
        Ranked AS (
            SELECT E.name, E.department_id, CS.salary, RANK() OVER (PARTITION BY E.department_id ORDER BY CS.salary DESC) as rnk
            FROM Employees E JOIN CurrentSalaries CS ON E.id = CS.employee_id
        )
        SELECT name, department_id, salary FROM Ranked WHERE rnk = 1;
        """
    },
    {
        "title": "Average Salary by Department",
        "description": "Calculate the average current salary for each department. Use `Employees`, `Departments`, and `Salaries` tables.",
        "difficulty": "Medium",
        "solution_sql": """
        WITH CurrentSalaries AS (
            SELECT employee_id, salary 
            FROM Salaries S1 
            WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id)
        )
        SELECT D.name, AVG(CS.salary)
        FROM Employees E
        JOIN CurrentSalaries CS ON E.id = CS.employee_id
        JOIN Departments D ON E.department_id = D.id
        GROUP BY D.name;
        """
    },
    {
        "title": "No Manager",
        "description": "List employees who do not have a manager from the `Employees` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT name FROM Employees WHERE manager_id IS NULL;"
    },
    {
        "title": "Salary History",
        "description": "For employee 'Alice', list all her salary changes ordered by date. Use `Employees` and `Salaries` tables.",
        "difficulty": "Easy",
        "solution_sql": "SELECT salary, effective_date FROM Salaries JOIN Employees ON Salaries.employee_id = Employees.id WHERE Employees.name = 'Alice' ORDER BY effective_date;"
    },
    {
        "title": "Departments with > 2 Employees",
        "description": "List departments that have more than 2 employees. Use `Departments` and `Employees` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT D.name FROM Departments D JOIN Employees E ON D.id = E.department_id GROUP BY D.name HAVING COUNT(E.id) > 2;"
    },
    {
        "title": "Cumulative Salary Cost",
        "description": "Calculate the running total of current salaries ordered by employee name. Use `Employees` and `Salaries` tables.",
        "difficulty": "Hard",
        "solution_sql": """
        WITH CurrentSalaries AS (
            SELECT employee_id, salary 
            FROM Salaries S1 
            WHERE effective_date = (SELECT MAX(effective_date) FROM Salaries S2 WHERE S2.employee_id = S1.employee_id)
        )
        SELECT E.name, CS.salary, SUM(CS.salary) OVER (ORDER BY E.name) as running_total
        FROM Employees E JOIN CurrentSalaries CS ON E.id = CS.employee_id;
        """
    },
    {
        "title": "Employees Hired Before Manager",
        "description": "Find employees who were hired before their manager. Use the `Employees` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT E.name FROM Employees E JOIN Employees M ON E.manager_id = M.id WHERE E.hire_date < M.hire_date;"
    },
    {
        "title": "Salary Growth",
        "description": "Calculate the percentage growth of salary for 'Alice' from her first to her latest salary. Use `Employees` and `Salaries` tables.",
        "difficulty": "Hard",
        "solution_sql": """
        WITH AliceSalaries AS (
            SELECT salary, effective_date FROM Salaries JOIN Employees ON Salaries.employee_id = Employees.id WHERE Employees.name = 'Alice'
        )
        SELECT ((MAX(salary) - MIN(salary)) * 100.0 / MIN(salary)) as growth_percentage FROM AliceSalaries;
        """
    },
    {
        "title": "Empty Departments",
        "description": "List departments that have no employees. Use `Departments` and `Employees` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT name FROM Departments WHERE id NOT IN (SELECT DISTINCT department_id FROM Employees WHERE department_id IS NOT NULL);"
    }
]

# -----------------------------------------------------------------------------
# CHAPTER 2: E-Commerce & Sales Analysis
# -----------------------------------------------------------------------------
ECOMMERCE_SETUP_SQL = """
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    country TEXT
);

CREATE TABLE IF NOT EXISTS Products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT,
    category TEXT,
    price REAL
);

CREATE TABLE IF NOT EXISTS Orders (
    order_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    order_date DATE,
    total_amount REAL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS OrderItems (
    item_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Seed Data
INSERT INTO Users VALUES (1, 'john_doe', 'USA'), (2, 'jane_smith', 'Canada'), (3, 'bob_brown', 'USA'), (4, 'alice_w', 'UK');
INSERT INTO Products VALUES (1, 'Laptop', 'Electronics', 1000), (2, 'Mouse', 'Electronics', 20), (3, 'T-Shirt', 'Apparel', 15), (4, 'Jeans', 'Apparel', 40), (5, 'Blender', 'Home', 50);
INSERT INTO Orders VALUES (101, 1, '2023-01-01', 1020), (102, 2, '2023-01-02', 55), (103, 1, '2023-02-01', 15), (104, 3, '2023-02-05', 1000), (105, 4, '2023-03-01', 90);
INSERT INTO OrderItems VALUES (1, 101, 1, 1), (2, 101, 2, 1), (3, 102, 3, 1), (4, 102, 4, 1), (5, 103, 3, 1), (6, 104, 1, 1), (7, 105, 4, 1), (8, 105, 5, 1);
"""

ECOMMERCE_PROBLEMS = [
    {
        "title": "List All Products",
        "description": "Select all product names and their prices from the `Products` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT product_name, price FROM Products;"
    },
    {
        "title": "Orders in 2023",
        "description": "Find all orders placed in 2023 from the `Orders` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT * FROM Orders WHERE strftime('%Y', order_date) = '2023';"
    },
    {
        "title": "Total Sales per User",
        "description": "Calculate the total amount spent by each user. Use the `Orders` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT user_id, SUM(total_amount) FROM Orders GROUP BY user_id;"
    },
    {
        "title": "Best Selling Product",
        "description": "Find the `product_name` that has been sold the most (by quantity). Use `Products` and `OrderItems` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT P.product_name FROM Products P JOIN OrderItems OI ON P.product_id = OI.product_id GROUP BY P.product_name ORDER BY SUM(OI.quantity) DESC LIMIT 1;"
    },
    {
        "title": "Users from USA",
        "description": "List usernames of users located in 'USA' from the `Users` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT username FROM Users WHERE country = 'USA';"
    },
    {
        "title": "Average Order Value",
        "description": "Calculate the average `total_amount` of all orders from the `Orders` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT AVG(total_amount) FROM Orders;"
    },
    {
        "title": "Products Never Sold",
        "description": "Find products that have never been ordered. Use `Products` and `OrderItems` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT product_name FROM Products WHERE product_id NOT IN (SELECT DISTINCT product_id FROM OrderItems);"
    },
    {
        "title": "High Value Orders",
        "description": "List orders with a `total_amount` greater than $500 from the `Orders` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT * FROM Orders WHERE total_amount > 500;"
    },
    {
        "title": "Revenue by Category",
        "description": "Calculate total revenue generated for each product category. Use `Products` and `OrderItems` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT P.category, SUM(OI.quantity * P.price) FROM Products P JOIN OrderItems OI ON P.product_id = OI.product_id GROUP BY P.category;"
    },
    {
        "title": "Users Who Bought Electronics",
        "description": "Find users who have purchased at least one product from the 'Electronics' category. Use `Users`, `Orders`, `OrderItems`, and `Products` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT DISTINCT U.username FROM Users U JOIN Orders O ON U.user_id = O.user_id JOIN OrderItems OI ON O.order_id = OI.order_id JOIN Products P ON OI.product_id = P.product_id WHERE P.category = 'Electronics';"
    },
    {
        "title": "Top Spender",
        "description": "Find the user who has spent the most money in total. Use `Users` and `Orders` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT U.username FROM Users U JOIN Orders O ON U.user_id = O.user_id GROUP BY U.username ORDER BY SUM(O.total_amount) DESC LIMIT 1;"
    },
    {
        "title": "Monthly Sales",
        "description": "Calculate total sales for each month from the `Orders` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT strftime('%Y-%m', order_date) as month, SUM(total_amount) FROM Orders GROUP BY month;"
    },
    {
        "title": "Orders with Multiple Items",
        "description": "List `order_id`s that contain more than 1 item from the `OrderItems` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT order_id FROM OrderItems GROUP BY order_id HAVING COUNT(item_id) > 1;"
    },
    {
        "title": "Product Sales Rank",
        "description": "Rank products by total revenue generated. Use `Products` and `OrderItems` tables.",
        "difficulty": "Hard",
        "solution_sql": "SELECT P.product_name, SUM(OI.quantity * P.price) as revenue, RANK() OVER (ORDER BY SUM(OI.quantity * P.price) DESC) as rnk FROM Products P JOIN OrderItems OI ON P.product_id = OI.product_id GROUP BY P.product_name;"
    },
    {
        "title": "First Order per User",
        "description": "Find the date of the first order placed by each user from the `Orders` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT user_id, MIN(order_date) FROM Orders GROUP BY user_id;"
    },
    {
        "title": "Users with No Orders",
        "description": "List users who have not placed any orders. Use `Users` and `Orders` tables.",
        "difficulty": "Easy",
        "solution_sql": "SELECT username FROM Users WHERE user_id NOT IN (SELECT DISTINCT user_id FROM Orders);"
    },
    {
        "title": "Cross-Sell Analysis",
        "description": "Find pairs of products that were bought in the same order. Use the `OrderItems` table.",
        "difficulty": "Hard",
        "solution_sql": "SELECT A.product_id, B.product_id, COUNT(*) as frequency FROM OrderItems A JOIN OrderItems B ON A.order_id = B.order_id WHERE A.product_id < B.product_id GROUP BY A.product_id, B.product_id ORDER BY frequency DESC;"
    },
    {
        "title": "Daily Revenue Running Total",
        "description": "Calculate the running total of revenue by date from the `Orders` table.",
        "difficulty": "Hard",
        "solution_sql": "SELECT order_date, SUM(total_amount), SUM(SUM(total_amount)) OVER (ORDER BY order_date) as running_total FROM Orders GROUP BY order_date;"
    },
    {
        "title": "Expensive Products",
        "description": "List products that cost more than the average product price from the `Products` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT product_name FROM Products WHERE price > (SELECT AVG(price) FROM Products);"
    },
    {
        "title": "Repeat Customers",
        "description": "Find users who have placed more than one order from the `Orders` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT user_id FROM Orders GROUP BY user_id HAVING COUNT(order_id) > 1;"
    }
]

# -----------------------------------------------------------------------------
# CHAPTER 3: University & Education System
# -----------------------------------------------------------------------------
EDU_SETUP_SQL = """
CREATE TABLE IF NOT EXISTS Students (
    student_id INTEGER PRIMARY KEY,
    name TEXT,
    major TEXT,
    year INTEGER
);

CREATE TABLE IF NOT EXISTS Professors (
    prof_id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT
);

CREATE TABLE IF NOT EXISTS Courses (
    course_id INTEGER PRIMARY KEY,
    title TEXT,
    credits INTEGER,
    prof_id INTEGER,
    FOREIGN KEY (prof_id) REFERENCES Professors(prof_id)
);

CREATE TABLE IF NOT EXISTS Enrollments (
    enrollment_id INTEGER PRIMARY KEY,
    student_id INTEGER,
    course_id INTEGER,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

-- Seed Data
INSERT INTO Students VALUES (1, 'Alice', 'CS', 1), (2, 'Bob', 'Math', 2), (3, 'Charlie', 'CS', 3), (4, 'David', 'Physics', 1);
INSERT INTO Professors VALUES (1, 'Dr. Smith', 'CS'), (2, 'Dr. Jones', 'Math'), (3, 'Dr. Brown', 'Physics');
INSERT INTO Courses VALUES (101, 'Intro to CS', 3, 1), (102, 'Calculus I', 4, 2), (103, 'Mechanics', 4, 3), (104, 'Algorithms', 3, 1);
INSERT INTO Enrollments VALUES (1, 1, 101, 'A'), (2, 1, 102, 'B'), (3, 2, 102, 'A'), (4, 3, 104, 'A'), (5, 3, 101, 'A'), (6, 4, 103, 'C');
"""

EDU_PROBLEMS = [
    {
        "title": "List CS Students",
        "description": "Find all students majoring in 'CS' from the `Students` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT name FROM Students WHERE major = 'CS';"
    },
    {
        "title": "Courses by Dr. Smith",
        "description": "List titles of courses taught by 'Dr. Smith'. Use `Courses` and `Professors` tables.",
        "difficulty": "Easy",
        "solution_sql": "SELECT C.title FROM Courses C JOIN Professors P ON C.prof_id = P.prof_id WHERE P.name = 'Dr. Smith';"
    },
    {
        "title": "Student Grades",
        "description": "Show all grades for student 'Alice'. Use `Enrollments`, `Courses`, and `Students` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT C.title, E.grade FROM Enrollments E JOIN Courses C ON E.course_id = C.course_id JOIN Students S ON E.student_id = S.student_id WHERE S.name = 'Alice';"
    },
    {
        "title": "Count Students per Major",
        "description": "Count the number of students in each major from the `Students` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT major, COUNT(*) FROM Students GROUP BY major;"
    },
    {
        "title": "Popular Courses",
        "description": "Find courses with more than 1 student enrolled. Use `Courses` and `Enrollments` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT C.title FROM Courses C JOIN Enrollments E ON C.course_id = E.course_id GROUP BY C.title HAVING COUNT(E.student_id) > 1;"
    },
    {
        "title": "Average Credits",
        "description": "Calculate the average number of credits for all courses from the `Courses` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT AVG(credits) FROM Courses;"
    },
    {
        "title": "Students with All As",
        "description": "Find students who have received an 'A' in all their courses. Use `Students` and `Enrollments` tables.",
        "difficulty": "Hard",
        "solution_sql": "SELECT S.name FROM Students S JOIN Enrollments E ON S.student_id = E.student_id GROUP BY S.name HAVING MIN(E.grade) = 'A' AND MAX(E.grade) = 'A';"
    },
    {
        "title": "Professors with No Courses",
        "description": "List professors who are not teaching any courses. Use `Professors` and `Courses` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT name FROM Professors WHERE prof_id NOT IN (SELECT DISTINCT prof_id FROM Courses);"
    },
    {
        "title": "Total Credits per Student",
        "description": "Calculate the total credits each student is enrolled in. Use `Students`, `Enrollments`, and `Courses` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT S.name, SUM(C.credits) FROM Students S JOIN Enrollments E ON S.student_id = E.student_id JOIN Courses C ON E.course_id = C.course_id GROUP BY S.name;"
    },
    {
        "title": "Course Enrollment List",
        "description": "List all students enrolled in 'Intro to CS'. Use `Students`, `Enrollments`, and `Courses` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT S.name FROM Students S JOIN Enrollments E ON S.student_id = E.student_id JOIN Courses C ON E.course_id = C.course_id WHERE C.title = 'Intro to CS';"
    },
    {
        "title": "Highest Credit Course",
        "description": "Find the course(s) with the highest number of credits from the `Courses` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT title FROM Courses WHERE credits = (SELECT MAX(credits) FROM Courses);"
    },
    {
        "title": "Students Taking Multiple Courses",
        "description": "Find students enrolled in more than one course. Use the `Enrollments` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT student_id FROM Enrollments GROUP BY student_id HAVING COUNT(course_id) > 1;"
    },
    {
        "title": "Department Course Count",
        "description": "Count how many courses are offered by each professor's department. Use `Professors` and `Courses` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT P.department, COUNT(C.course_id) FROM Professors P JOIN Courses C ON P.prof_id = C.prof_id GROUP BY P.department;"
    },
    {
        "title": "Grade Distribution",
        "description": "Count how many students received each grade (A, B, C, etc.) from the `Enrollments` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT grade, COUNT(*) FROM Enrollments GROUP BY grade;"
    },
    {
        "title": "Top Performing Students",
        "description": "Rank students by the number of 'A' grades they have received. Use `Students` and `Enrollments` tables.",
        "difficulty": "Hard",
        "solution_sql": "SELECT S.name, COUNT(E.grade) as a_count, RANK() OVER (ORDER BY COUNT(E.grade) DESC) as rnk FROM Students S JOIN Enrollments E ON S.student_id = E.student_id WHERE E.grade = 'A' GROUP BY S.name;"
    },
    {
        "title": "Freshmen Students",
        "description": "List students who are in year 1 from the `Students` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT name FROM Students WHERE year = 1;"
    },
    {
        "title": "Courses Without Enrollments",
        "description": "Find courses that have zero students enrolled. Use `Courses` and `Enrollments` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT title FROM Courses WHERE course_id NOT IN (SELECT DISTINCT course_id FROM Enrollments);"
    },
    {
        "title": "Student-Professor Interaction",
        "description": "List pairs of Student Name and Professor Name where the student is enrolled in the professor's course. Use `Students`, `Enrollments`, `Courses`, and `Professors` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT S.name, P.name FROM Students S JOIN Enrollments E ON S.student_id = E.student_id JOIN Courses C ON E.course_id = C.course_id JOIN Professors P ON C.prof_id = P.prof_id;"
    },
    {
        "title": "GPA Calculation (Simplified)",
        "description": "Assuming A=4, B=3, C=2, D=1, F=0, calculate the GPA for 'Alice'. Use `Enrollments` and `Students` tables.",
        "difficulty": "Hard",
        "solution_sql": "SELECT AVG(CASE WHEN grade = 'A' THEN 4 WHEN grade = 'B' THEN 3 WHEN grade = 'C' THEN 2 WHEN grade = 'D' THEN 1 ELSE 0 END) FROM Enrollments E JOIN Students S ON E.student_id = S.student_id WHERE S.name = 'Alice';"
    },
    {
        "title": "Shared Courses",
        "description": "Find pairs of students who are taking the same course. Use the `Enrollments` table.",
        "difficulty": "Hard",
        "solution_sql": "SELECT E1.student_id, E2.student_id, E1.course_id FROM Enrollments E1 JOIN Enrollments E2 ON E1.course_id = E2.course_id WHERE E1.student_id < E2.student_id;"
    }
]

# -----------------------------------------------------------------------------
# CHAPTER 4: Banking & Finance
# -----------------------------------------------------------------------------
FINANCE_SETUP_SQL = """
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INTEGER PRIMARY KEY,
    name TEXT,
    city TEXT
);

CREATE TABLE IF NOT EXISTS Accounts (
    account_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    account_type TEXT,
    balance REAL,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);

CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INTEGER PRIMARY KEY,
    account_id INTEGER,
    transaction_date DATE,
    amount REAL,
    transaction_type TEXT, -- 'Deposit', 'Withdrawal'
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id)
);

-- Seed Data
INSERT INTO Customers VALUES (1, 'Alice', 'NY'), (2, 'Bob', 'LA'), (3, 'Charlie', 'NY');
INSERT INTO Accounts VALUES (101, 1, 'Savings', 5000), (102, 1, 'Checking', 1000), (103, 2, 'Savings', 3000), (104, 3, 'Checking', 2000);
INSERT INTO Transactions VALUES 
(1, 101, '2023-01-01', 1000, 'Deposit'),
(2, 101, '2023-01-05', -200, 'Withdrawal'),
(3, 102, '2023-01-02', 500, 'Deposit'),
(4, 103, '2023-01-10', 100, 'Deposit'),
(5, 101, '2023-02-01', -50, 'Withdrawal'),
(6, 104, '2023-02-05', 2000, 'Deposit');
"""

FINANCE_PROBLEMS = [
    {
        "title": "List All Accounts",
        "description": "Show all account IDs and their types from the `Accounts` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT account_id, account_type FROM Accounts;"
    },
    {
        "title": "Customers in NY",
        "description": "Find customers who live in 'NY' from the `Customers` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT name FROM Customers WHERE city = 'NY';"
    },
    {
        "title": "Total Balance per Customer",
        "description": "Calculate the total balance across all accounts for each customer. Use `Customers` and `Accounts` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT C.name, SUM(A.balance) FROM Customers C JOIN Accounts A ON C.customer_id = A.customer_id GROUP BY C.name;"
    },
    {
        "title": "Large Transactions",
        "description": "Find transactions with an absolute amount greater than 500 from the `Transactions` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT * FROM Transactions WHERE ABS(amount) > 500;"
    },
    {
        "title": "Transaction Count per Account",
        "description": "Count the number of transactions for each account from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT account_id, COUNT(*) FROM Transactions GROUP BY account_id;"
    },
    {
        "title": "Recent Withdrawals",
        "description": "List all 'Withdrawal' transactions ordered by date descending from the `Transactions` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT * FROM Transactions WHERE transaction_type = 'Withdrawal' ORDER BY transaction_date DESC;"
    },
    {
        "title": "Customers with Savings Accounts",
        "description": "Find customers who have a 'Savings' account. Use `Customers` and `Accounts` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT DISTINCT C.name FROM Customers C JOIN Accounts A ON C.customer_id = A.customer_id WHERE A.account_type = 'Savings';"
    },
    {
        "title": "Average Transaction Amount",
        "description": "Calculate the average transaction amount (absolute value) from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT AVG(ABS(amount)) FROM Transactions;"
    },
    {
        "title": "Running Balance",
        "description": "Calculate the running balance for account 101 ordered by transaction date from the `Transactions` table.",
        "difficulty": "Hard",
        "solution_sql": "SELECT transaction_date, amount, SUM(amount) OVER (ORDER BY transaction_date) as running_balance FROM Transactions WHERE account_id = 101;"
    },
    {
        "title": "Richest Customer",
        "description": "Find the customer with the highest total balance. Use `Customers` and `Accounts` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT C.name FROM Customers C JOIN Accounts A ON C.customer_id = A.customer_id GROUP BY C.name ORDER BY SUM(A.balance) DESC LIMIT 1;"
    },
    {
        "title": "Accounts with No Transactions",
        "description": "List accounts that have no recorded transactions. Use `Accounts` and `Transactions` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT account_id FROM Accounts WHERE account_id NOT IN (SELECT DISTINCT account_id FROM Transactions);"
    },
    {
        "title": "Monthly Transaction Volume",
        "description": "Calculate the total number of transactions per month from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT strftime('%Y-%m', transaction_date) as month, COUNT(*) FROM Transactions GROUP BY month;"
    },
    {
        "title": "First Transaction",
        "description": "Find the date of the first transaction for each account from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT account_id, MIN(transaction_date) FROM Transactions GROUP BY account_id;"
    },
    {
        "title": "Deposits vs Withdrawals",
        "description": "Compare the total amount deposited vs withdrawn from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT transaction_type, SUM(ABS(amount)) FROM Transactions GROUP BY transaction_type;"
    },
    {
        "title": "Rank Accounts by Balance",
        "description": "Rank accounts by their current balance from the `Accounts` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT account_id, balance, RANK() OVER (ORDER BY balance DESC) as rnk FROM Accounts;"
    },
    {
        "title": "Customers with Multiple Accounts",
        "description": "Find customers who have more than one account from the `Accounts` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT customer_id FROM Accounts GROUP BY customer_id HAVING COUNT(account_id) > 1;"
    },
    {
        "title": "Net Flow per Account",
        "description": "Calculate the net change (sum of amounts) for each account based on transactions from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT account_id, SUM(amount) FROM Transactions GROUP BY account_id;"
    },
    {
        "title": "High Activity Accounts",
        "description": "Find accounts with more than 2 transactions from the `Transactions` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT account_id FROM Transactions GROUP BY account_id HAVING COUNT(*) > 2;"
    },
    {
        "title": "Last Transaction Date",
        "description": "Find the most recent transaction date for each customer. Use `Customers`, `Accounts`, and `Transactions` tables.",
        "difficulty": "Hard",
        "solution_sql": "SELECT C.name, MAX(T.transaction_date) FROM Customers C JOIN Accounts A ON C.customer_id = A.customer_id JOIN Transactions T ON A.account_id = T.account_id GROUP BY C.name;"
    },
    {
        "title": "Balance Percentage",
        "description": "Calculate what percentage of the total bank deposits belongs to each account from the `Accounts` table.",
        "difficulty": "Hard",
        "solution_sql": "SELECT account_id, balance * 100.0 / (SELECT SUM(balance) FROM Accounts) as percentage FROM Accounts;"
    }
]

# -----------------------------------------------------------------------------
# CHAPTER 5: Social Media & User Engagement
# -----------------------------------------------------------------------------
SOCIAL_SETUP_SQL = """
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    join_date DATE
);

CREATE TABLE IF NOT EXISTS Posts (
    post_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    content TEXT,
    post_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Likes (
    like_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    post_id INTEGER,
    like_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (post_id) REFERENCES Posts(post_id)
);

CREATE TABLE IF NOT EXISTS Follows (
    follower_id INTEGER,
    followee_id INTEGER,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES Users(user_id),
    FOREIGN KEY (followee_id) REFERENCES Users(user_id)
);

-- Seed Data
INSERT INTO Users VALUES (1, 'alice', '2022-01-01'), (2, 'bob', '2022-02-01'), (3, 'charlie', '2022-03-01'), (4, 'dave', '2022-04-01');
INSERT INTO Posts VALUES (1, 1, 'Hello World', '2023-01-01'), (2, 1, 'My second post', '2023-01-02'), (3, 2, 'Bob here', '2023-01-05'), (4, 3, 'Charlie loves SQL', '2023-02-01');
INSERT INTO Likes VALUES (1, 2, 1, '2023-01-01'), (2, 3, 1, '2023-01-02'), (3, 1, 3, '2023-01-06'), (4, 4, 1, '2023-01-03'), (5, 2, 2, '2023-01-03');
INSERT INTO Follows VALUES (2, 1), (3, 1), (4, 1), (1, 2), (3, 2);
"""

SOCIAL_PROBLEMS = [
    {
        "title": "List All Users",
        "description": "Select all usernames from the `Users` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT username FROM Users;"
    },
    {
        "title": "Count Posts per User",
        "description": "Count how many posts each user has made from the `Posts` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT user_id, COUNT(*) FROM Posts GROUP BY user_id;"
    },
    {
        "title": "Most Liked Post",
        "description": "Find the `post_id` that has received the most likes from the `Likes` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT post_id FROM Likes GROUP BY post_id ORDER BY COUNT(*) DESC LIMIT 1;"
    },
    {
        "title": "Users Who Follow Alice",
        "description": "Find the usernames of users who follow 'alice' (user_id=1). Use `Users` and `Follows` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT U.username FROM Users U JOIN Follows F ON U.user_id = F.follower_id WHERE F.followee_id = 1;"
    },
    {
        "title": "Mutual Follows",
        "description": "Find pairs of users who follow each other. Use the `Follows` table.",
        "difficulty": "Hard",
        "solution_sql": "SELECT F1.follower_id, F1.followee_id FROM Follows F1 JOIN Follows F2 ON F1.follower_id = F2.followee_id AND F1.followee_id = F2.follower_id WHERE F1.follower_id < F1.followee_id;"
    },
    {
        "title": "Posts with No Likes",
        "description": "Find posts that have zero likes. Use `Posts` and `Likes` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT post_id FROM Posts WHERE post_id NOT IN (SELECT DISTINCT post_id FROM Likes);"
    },
    {
        "title": "User Engagement Score",
        "description": "Calculate a score for each user: 1 point per post + 1 point per like received. Use `Users`, `Posts`, and `Likes` tables.",
        "difficulty": "Hard",
        "solution_sql": """
        WITH PostCounts AS (SELECT user_id, COUNT(*) as cnt FROM Posts GROUP BY user_id),
             LikeCounts AS (SELECT P.user_id, COUNT(*) as cnt FROM Posts P JOIN Likes L ON P.post_id = L.post_id GROUP BY P.user_id)
        SELECT U.username, COALESCE(PC.cnt, 0) + COALESCE(LC.cnt, 0) as score
        FROM Users U 
        LEFT JOIN PostCounts PC ON U.user_id = PC.user_id
        LEFT JOIN LikeCounts LC ON U.user_id = LC.user_id;
        """
    },
    {
        "title": "First 3 Users",
        "description": "List the first 3 users who joined the platform from the `Users` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT username FROM Users ORDER BY join_date LIMIT 3;"
    },
    {
        "title": "Likes on Own Posts",
        "description": "Find users who have liked their own posts. Use `Likes` and `Posts` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT DISTINCT L.user_id FROM Likes L JOIN Posts P ON L.post_id = P.post_id WHERE L.user_id = P.user_id;"
    },
    {
        "title": "Follower Count",
        "description": "Count how many followers each user has from the `Follows` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT followee_id, COUNT(*) FROM Follows GROUP BY followee_id;"
    },
    {
        "title": "Posts in Jan 2023",
        "description": "List posts created in January 2023 from the `Posts` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT * FROM Posts WHERE strftime('%Y-%m', post_date) = '2023-01';"
    },
    {
        "title": "Users Without Posts",
        "description": "Find users who have never posted. Use `Users` and `Posts` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT username FROM Users WHERE user_id NOT IN (SELECT DISTINCT user_id FROM Posts);"
    },
    {
        "title": "Viral Posts",
        "description": "Find posts that have more than 2 likes from the `Likes` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT post_id FROM Likes GROUP BY post_id HAVING COUNT(*) > 2;"
    },
    {
        "title": "Latest Post per User",
        "description": "Find the most recent post for each user from the `Posts` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT user_id, MAX(post_date) FROM Posts GROUP BY user_id;"
    },
    {
        "title": "Commenters (Simulated)",
        "description": "Assuming a Comments table existed, write a query to count comments per post (Use `Likes` table as proxy for this exercise).",
        "difficulty": "Easy",
        "solution_sql": "SELECT post_id, COUNT(*) FROM Likes GROUP BY post_id;"
    },
    {
        "title": "Popularity Rank",
        "description": "Rank users by their follower count from the `Follows` table.",
        "difficulty": "Medium",
        "solution_sql": "SELECT followee_id, COUNT(*) as followers, RANK() OVER (ORDER BY COUNT(*) DESC) as rnk FROM Follows GROUP BY followee_id;"
    },
    {
        "title": "Active Users",
        "description": "Users who have either posted or liked something. Use `Posts` and `Likes` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT user_id FROM Posts UNION SELECT user_id FROM Likes;"
    },
    {
        "title": "Friend Recommendation",
        "description": "Recommend users to follow: Users who are followed by people I follow (Friend of a Friend). Focus on user 1. Use the `Follows` table.",
        "difficulty": "Hard",
        "solution_sql": """
        SELECT DISTINCT F2.followee_id 
        FROM Follows F1 JOIN Follows F2 ON F1.followee_id = F2.follower_id 
        WHERE F1.follower_id = 1 AND F2.followee_id != 1;
        """
    },
    {
        "title": "Daily Likes",
        "description": "Count total likes given on each day from the `Likes` table.",
        "difficulty": "Easy",
        "solution_sql": "SELECT like_date, COUNT(*) FROM Likes GROUP BY like_date;"
    },
    {
        "title": "Unpopular Users",
        "description": "Users with 0 followers. Use `Users` and `Follows` tables.",
        "difficulty": "Medium",
        "solution_sql": "SELECT username FROM Users WHERE user_id NOT IN (SELECT DISTINCT followee_id FROM Follows);"
    }
]

# -----------------------------------------------------------------------------
# SEED FUNCTION
# -----------------------------------------------------------------------------

def seed_sql_data():
    db: Session = SessionLocal()
    try:
        # Clear existing SQL curriculum data to avoid conflicts
        logger.info("Clearing existing SQL curriculum data...")
        db.query(models.SQLSubmission).delete()
        db.query(models.SQLProblem).delete()
        db.query(models.SQLChapter).delete()
        db.commit()

        # Define Chapters
        # -----------------------------------------------------------------------------
        # REORGANIZE PROBLEMS BY TOPIC
        # -----------------------------------------------------------------------------
        
        # 1. Collect ALL problems from all domains
        all_problems = []
        
        # Helper to add problems with their setup SQL
        def add_problems(problems_list, setup_sql):
            for p in problems_list:
                all_problems.append({
                    "title": p["title"],
                    "description": p["description"],
                    "difficulty": p["difficulty"],
                    "solution_sql": p["solution_sql"],
                    "setup_sql": setup_sql
                })

        # Add hardcoded problems
        add_problems(HR_PROBLEMS, HR_SETUP_SQL)
        add_problems(ECOMMERCE_PROBLEMS, ECOMMERCE_SETUP_SQL)
        add_problems(EDU_PROBLEMS, EDU_SETUP_SQL)
        add_problems(FINANCE_PROBLEMS, FINANCE_SETUP_SQL)
        add_problems(SOCIAL_PROBLEMS, SOCIAL_SETUP_SQL)

        # Add generated problems
        from generate_sql_problems import (
            generate_healthcare_problems,
            generate_logistics_problems,
            generate_sports_problems,
            generate_music_problems,
            generate_rideshare_problems
        )

        new_chapters_generators = [
            generate_healthcare_problems,
            generate_logistics_problems,
            generate_sports_problems,
            generate_music_problems,
            generate_rideshare_problems
        ]

        for gen in new_chapters_generators:
            title, setup, problems = gen()
            for p_title, p_desc, p_diff, p_sol in problems:
                all_problems.append({
                    "title": p_title,
                    "description": p_desc,
                    "difficulty": p_diff,
                    "solution_sql": p_sol,
                    "setup_sql": setup
                })

        # 2. Define Topic Chapters
        topic_chapters = {
            "Basic SQL": {
                "order": 1,
                "content": "Master the fundamentals: SELECT, WHERE, and basic filtering.",
                "problems": []
            },
            "Filtering & Sorting": {
                "order": 2,
                "content": "Learn to filter data precisely and sort results.",
                "problems": []
            },
            "Joins": {
                "order": 3,
                "content": "Combine data from multiple tables using INNER, LEFT, and Self Joins.",
                "problems": []
            },
            "Aggregation": {
                "order": 4,
                "content": "Summarize data using GROUP BY, SUM, COUNT, AVG, and HAVING.",
                "problems": []
            },
            "Window Functions": {
                "order": 5,
                "content": "Perform advanced calculations across rows using RANK, DENSE_RANK, LEAD, LAG, and OVER.",
                "problems": []
            },
            "Advanced SQL": {
                "order": 6,
                "content": "Tackle complex problems with CTEs (WITH), Subqueries, and Set Operations.",
                "problems": []
            }
        }

        # 3. Categorize Problems
        for p in all_problems:
            sql = p["solution_sql"].upper()
            
            if "OVER (" in sql or "RANK()" in sql or "LEAD(" in sql or "LAG(" in sql or "ROW_NUMBER()" in sql:
                topic_chapters["Window Functions"]["problems"].append(p)
            elif "WITH " in sql or "UNION" in sql or "INTERSECT" in sql or "EXCEPT" in sql:
                topic_chapters["Advanced SQL"]["problems"].append(p)
            elif "JOIN" in sql:
                topic_chapters["Joins"]["problems"].append(p)
            elif "GROUP BY" in sql or "SUM(" in sql or "COUNT(" in sql or "AVG(" in sql or "MAX(" in sql or "MIN(" in sql or "HAVING" in sql:
                topic_chapters["Aggregation"]["problems"].append(p)
            elif "ORDER BY" in sql or "LIMIT" in sql or "DISTINCT" in sql or "LIKE" in sql or "IN (" in sql:
                topic_chapters["Filtering & Sorting"]["problems"].append(p)
            else:
                topic_chapters["Basic SQL"]["problems"].append(p)

        # 4. Seed Chapters and Problems
        for title, data in topic_chapters.items():
            # Create Chapter
            chapter = db.query(models.SQLChapter).filter(models.SQLChapter.title == title).first()
            if not chapter:
                chapter = models.SQLChapter(
                    title=title,
                    content=data["content"],
                    order=data["order"]
                )
                db.add(chapter)
                db.commit()
                db.refresh(chapter)
                logger.info(f"Created Chapter: {chapter.title}")
            else:
                logger.info(f"Chapter already exists: {chapter.title}")

            # Add Problems
            for prob_data in data["problems"]:
                exists = db.query(models.SQLProblem).filter(
                    models.SQLProblem.title == prob_data["title"],
                    models.SQLProblem.chapter_id == chapter.id
                ).first()

                if not exists:
                    problem = models.SQLProblem(
                        chapter_id=chapter.id,
                        title=prob_data["title"],
                        description=prob_data["description"],
                        difficulty=prob_data["difficulty"],
                        setup_sql=prob_data["setup_sql"],
                        solution_sql=prob_data["solution_sql"]
                    )
                    db.add(problem)
                    logger.info(f"  Added Problem: {problem.title}")
                else:
                    logger.info(f"  Problem already exists: {prob_data['title']}")
            
            db.commit()

        logger.info("SQL Data Seeding Completed Successfully.")

    except Exception as e:
        logger.error(f"Error seeding SQL data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_sql_data()
