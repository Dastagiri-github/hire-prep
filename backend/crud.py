from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        target_companies=user.target_companies,
        stats={"totalSolved": 0, "currentStreak": 0, "topics": {}}
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

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
        hidden_test_cases=[t.dict() for t in problem.hidden_test_cases]
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def create_submission(db: Session, submission: schemas.SubmissionCreate, user_id: int, status: str, execution_time: int):
    db_submission = models.Submission(
        **submission.dict(),
        user_id=user_id,
        status=status,
        execution_time=execution_time
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission
