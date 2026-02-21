from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


# User Schemas
class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str
    target_companies: List[str] = []


class User(UserBase):
    id: int
    target_companies: List[str]
    stats: Dict[str, Any]
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
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# SQL Schemas
class SQLProblemBase(BaseModel):
    title: str
    description: str
    chapter_id: int
    difficulty: str = "Easy"


class SQLProblemCreate(SQLProblemBase):
    setup_sql: str
    solution_sql: str


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
