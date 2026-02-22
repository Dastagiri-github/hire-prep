import secrets
import string
from datetime import date

from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models
import schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def generate_temp_password(length: int = 10) -> str:
    """Generate a readable temporary password: e.g. HirePrep@a3Xk9"""
    alphabet = string.ascii_letters + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"HirePrep@{suffix}"


def create_user(db: Session, user: schemas.UserCreate) -> tuple[models.User, str]:
    """Create user with a temp password. Returns (user, temp_password)."""
    temp_password = generate_temp_password()
    hashed_password = get_password_hash(temp_password)

    # Parse DOB string to date object
    try:
        dob = date.fromisoformat(user.dob) if user.dob else None
    except ValueError:
        dob = None

    db_user = models.User(
        username=user.username,
        email=user.email,
        name=user.name,
        dob=dob,
        hashed_password=hashed_password,
        reset_password=1,
        target_companies=[],
        stats={"totalSolved": 0, "currentStreak": 0, "topics": {}},
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user, temp_password


def get_employee_by_username(db: Session, username: str):
    return db.query(models.Employee).filter(models.Employee.username == username).first()


def create_employee(db: Session, employee: schemas.EmployeeCreate) -> tuple[models.Employee, str]:
    """Create employee with a temp password. Returns (employee, temp_password)."""
    temp_password = generate_temp_password()
    hashed_password = get_password_hash(temp_password)

    db_employee = models.Employee(
        username=employee.username,
        email=employee.email,
        name=employee.name,
        hashed_password=hashed_password,
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee, temp_password
def get_problems(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Problem).offset(skip).limit(limit).all()


def get_problem(db: Session, problem_id: int):
    return db.query(models.Problem).filter(models.Problem.id == problem_id).first()


def create_problem(db: Session, problem: schemas.ProblemCreate):
    # Convert Pydantic models to dicts for JSON storage
    db_problem = models.Problem(
        title=problem.title,
        description=problem.description,
        difficulty=problem.difficulty,
        tags=problem.tags,
        companies=problem.companies,
        sample_test_cases=[t.dict() for t in problem.sample_test_cases],
        hidden_test_cases=[t.dict() for t in problem.hidden_test_cases],
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


def create_submission(
    db: Session,
    submission: schemas.SubmissionCreate,
    user_id: int,
    status: str,
    execution_time: int,
):
    db_submission = models.Submission(
        **submission.dict(),
        user_id=user_id,
        status=status,
        execution_time=execution_time,
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission
