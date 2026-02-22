import datetime

from sqlalchemy import JSON, Boolean, Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)        # full name
    dob = Column(Date, nullable=True)           # date of birth
    hashed_password = Column(String)
    reset_password = Column(Integer, default=1) # 1 = must change, 0 = normal
    target_companies = Column(JSON, default=[])
    stats = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    submissions = relationship("Submission", back_populates="user")
    sql_submissions = relationship("SQLSubmission", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="refresh_tokens")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    refresh_tokens = relationship("EmployeeRefreshToken", back_populates="employee", cascade="all, delete-orphan")


class EmployeeRefreshToken(Base):
    __tablename__ = "employee_refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)

    employee = relationship("Employee", back_populates="refresh_tokens")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    difficulty = Column(String)  # Easy, Medium, Hard
    tags = Column(JSON, default=[])
    companies = Column(JSON, default=[])
    sample_test_cases = Column(JSON, default=[])
    hidden_test_cases = Column(JSON, default=[])

    submissions = relationship("Submission", back_populates="problem")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    problem_id = Column(Integer, ForeignKey("problems.id"))
    code = Column(String)
    language = Column(String)
    status = Column(String)  # Accepted, Wrong Answer, TLE
    execution_time = Column(Integer)  # ms
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")


class SQLChapter(Base):
    __tablename__ = "sql_chapters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)  # Markdown content
    order = Column(Integer, unique=True)

    problems = relationship("SQLProblem", back_populates="chapter")


class SQLProblem(Base):
    __tablename__ = "sql_problems"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("sql_chapters.id"))
    title = Column(String)
    description = Column(String)
    difficulty = Column(String, default="Easy")  # Easy, Medium, Hard
    setup_sql = Column(String)  # Hidden
    solution_sql = Column(String)  # Hidden

    chapter = relationship("SQLChapter", back_populates="problems")
    submissions = relationship("SQLSubmission", back_populates="problem")


class SQLSubmission(Base):
    __tablename__ = "sql_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    problem_id = Column(Integer, ForeignKey("sql_problems.id"))
    query = Column(String)
    status = Column(String)  # Correct, Incorrect
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sql_submissions")
    problem = relationship("SQLProblem", back_populates="submissions")
