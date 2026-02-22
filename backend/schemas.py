from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


# User Schemas
class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    name: str
    dob: str  # ISO date string e.g. "1995-06-15"


class User(UserBase):
    id: int
    name: Optional[str] = None
    dob: Optional[date] = None
    reset_password: int = 1
    target_companies: List[str]
    stats: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# Employee Schemas
class EmployeeBase(BaseModel):
    username: str
    email: str


class EmployeeCreate(EmployeeBase):
    name: str


class Employee(EmployeeBase):
    id: int
    name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Problem Schemas
class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None


class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: str
    tags: List[str]
    companies: List[str]
    sample_test_cases: List[TestCase]


class ProblemCreate(ProblemBase):
    hidden_test_cases: List[TestCase]

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    companies: Optional[List[str]] = None
    sample_test_cases: Optional[List[TestCase]] = None
    hidden_test_cases: Optional[List[TestCase]] = None


class Problem(ProblemBase):
    id: int

    class Config:
        from_attributes = True


# Submission Schemas
class SubmissionBase(BaseModel):
    code: str
    language: str
    problem_id: int


class SubmissionCreate(SubmissionBase):
    pass


class Submission(SubmissionBase):
    id: int
    user_id: int
    status: str
    execution_time: Optional[int]
    submitted_at: datetime
    message: Optional[str] = None
    actual_output: Optional[str] = None
    expected_output: Optional[str] = None

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    reset_password: int = 0  # 1 = redirect to change-password


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    temp_password: str
    new_password: str
    confirm_password: str


# SQL Schemas
class SQLProblemBase(BaseModel):
    title: str
    description: str
    chapter_id: int
    difficulty: str = "Easy"


class SQLProblemCreate(SQLProblemBase):
    setup_sql: str
    solution_sql: str

class SQLProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    chapter_id: Optional[int] = None
    difficulty: Optional[str] = None
    setup_sql: Optional[str] = None
    solution_sql: Optional[str] = None

class SQLProblem(SQLProblemBase):
    id: int
    tables: Dict[str, List[Dict[str, Any]]] = {}

    class Config:
        from_attributes = True


class SQLSubmissionBase(BaseModel):
    query: str
    problem_id: int


class SQLSubmissionCreate(SQLSubmissionBase):
    pass


class SQLSubmission(SQLSubmissionBase):
    id: int
    user_id: int
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True


class SQLChapterBase(BaseModel):
    title: str
    content: str
    order: int


class SQLChapterCreate(SQLChapterBase):
    pass

class SQLChapterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None

class SQLChapter(SQLChapterBase):
    id: int
    problems: List[SQLProblem] = []

    class Config:
        from_attributes = True


class SQLExecutionRequest(BaseModel):
    problem_id: int
    user_query: str


class SQLExecutionResult(BaseModel):
    success: bool
    user_result: List[Dict[str, Any]] = []
    expected_result: List[Dict[str, Any]] = []
    error: Optional[str] = None
    columns: List[str] = []
    tables: Dict[str, List[Dict[str, Any]]] = {}
