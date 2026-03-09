from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
import database
from dependencies import get_current_employee

router = APIRouter(
    prefix="/employee/dashboard",
    tags=["employee_dashboard"],
    dependencies=[Depends(get_current_employee)]
)

@router.get("/metrics")
def get_metrics(db: Session = Depends(database.get_db)):
    """Fetch high-level metrics for the employee dashboard."""
    user_count = db.query(models.User).count()
    problem_count = db.query(models.Problem).count()
    submission_count = db.query(models.Submission).count()
    sql_problem_count = db.query(models.SQLProblem).count()
    aptitude_chapter_count = db.query(models.AptitudeChapter).count()
    aptitude_problem_count = db.query(models.AptitudeProblem).count()
    
    return {
        "users": user_count,
        "problems": problem_count,
        "submissions": submission_count,
        "sql_problems": sql_problem_count,
        "aptitude_chapters": aptitude_chapter_count,
        "aptitude_problems": aptitude_problem_count
    }


@router.get("/users", response_model=List[schemas.EmployeeUserStat])
def get_all_users_stats(db: Session = Depends(database.get_db)):
    """Fetch detailed statistics for all users for the employee dashboard."""
    users = db.query(models.User).all()
    
    # 1. Total Problems Solved per user (distinct problem_type + problem_id)
    # Group by user_id
    solved_counts = db.query(
        models.UserPerformanceLog.user_id,
        func.count(func.distinct(func.concat(models.UserPerformanceLog.problem_type, "_", models.UserPerformanceLog.problem_id)))
    ).filter(
        models.UserPerformanceLog.status.in_(["Accepted", "Correct"])
    ).group_by(
        models.UserPerformanceLog.user_id
    ).all()
    
    user_solved_map = {item[0]: item[1] for item in solved_counts}

    # 2. Total Time Spent per user
    time_counts = db.query(
        models.UserDailyActivity.user_id,
        func.sum(models.UserDailyActivity.time_spent_seconds)
    ).group_by(
        models.UserDailyActivity.user_id
    ).all()
    
    user_time_map = {item[0]: item[1] for item in time_counts}
    
    result = []
    for u in users:
        result.append(schemas.EmployeeUserStat(
            id=u.id,
            name=u.name,
            username=u.username,
            email=u.email,
            created_at=u.created_at,
            total_solved=user_solved_map.get(u.id, 0),
            total_time_spent_seconds=user_time_map.get(u.id, 0),
            reputation=u.reputation
        ))
        
    return result


# ==========================================
# Daily Challenge Management
# ==========================================

@router.post("/daily-challenge", response_model=schemas.DailyChallengeResponse)
def assign_daily_challenge(
    challenge: schemas.DailyChallengeCreate, 
    db: Session = Depends(database.get_db),
    current_employee: models.Employee = Depends(get_current_employee)
):
    """Assign a problem of the day for a specific date"""
    
    # 1. Check if challenge already exists for this date
    existing = db.query(models.DailyChallenge).filter(models.DailyChallenge.date == challenge.date).first()
    
    if existing:
        existing.problem_id = challenge.problem_id
        existing.problem_type = challenge.problem_type
        existing.assigned_by_id = current_employee.id
        db_challenge = existing
    else:
        db_challenge = models.DailyChallenge(
            date=challenge.date,
            problem_id=challenge.problem_id,
            problem_type=challenge.problem_type,
            assigned_by_id=current_employee.id
        )
        db.add(db_challenge)
        
    db.commit()
    db.refresh(db_challenge)
    
    # Fetch title and difficulty for response
    title = ""
    difficulty = ""
    description = ""
    
    if challenge.problem_type == "coding":
        prob = db.query(models.Problem).filter(models.Problem.id == challenge.problem_id).first()
        if prob:
            title = prob.title
            difficulty = prob.difficulty
            description = prob.description
    elif challenge.problem_type == "sql":
        prob = db.query(models.SQLProblem).filter(models.SQLProblem.id == challenge.problem_id).first()
        if prob:
            title = prob.title
            difficulty = prob.difficulty
            description = prob.description
    elif challenge.problem_type == "aptitude":
        prob = db.query(models.AptitudeProblem).filter(models.AptitudeProblem.id == challenge.problem_id).first()
        if prob:
            title = prob.title
            difficulty = prob.difficulty
            description = prob.description

    return {
        "date": db_challenge.date,
        "problem_id": db_challenge.problem_id,
        "problem_type": db_challenge.problem_type,
        "title": title,
        "difficulty": difficulty,
        "description": description
    }


# ==========================================
# DSA Problems Management
# ==========================================

@router.get("/problems/random")
def get_random_problem(problem_type: str = "coding", db: Session = Depends(database.get_db)):
    """Fetch a random problem ID based on its type"""
    
    # Use standard SQLAlchemy func.random() which maps to RANDOM() in SQLite/PostgreSQL
    # Adjust to func.rand() if using MySQL
    if problem_type == "coding":
        prob = db.query(models.Problem.id).order_by(func.random()).first()
    elif problem_type == "sql":
        prob = db.query(models.SQLProblem.id).order_by(func.random()).first()
    elif problem_type == "aptitude":
        prob = db.query(models.AptitudeProblem.id).order_by(func.random()).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid problem type")
        
    if not prob:
        raise HTTPException(status_code=404, detail="No problems found for this type")
        
    return {"problem_id": prob[0]}

@router.post("/problems", response_model=schemas.Problem)
def create_problem(problem: schemas.ProblemCreate, db: Session = Depends(database.get_db)):
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


@router.put("/problems/{problem_id}", response_model=schemas.Problem)
def update_problem(problem_id: int, problem: schemas.ProblemUpdate, db: Session = Depends(database.get_db)):
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    update_data = problem.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key in ["sample_test_cases", "hidden_test_cases"]:
            setattr(db_problem, key, [t for t in value])
        else:
            setattr(db_problem, key, value)
            
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/problems/{problem_id}")
def delete_problem(problem_id: int, db: Session = Depends(database.get_db)):
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    db.delete(db_problem)
    db.commit()
    return {"message": "Problem deleted successfully"}


# ==========================================
# SQL Chapters & Problems Management
# ==========================================

@router.post("/sql/chapters", response_model=schemas.SQLChapter)
def create_sql_chapter(chapter: schemas.SQLChapterCreate, db: Session = Depends(database.get_db)):
    db_chapter = models.SQLChapter(**chapter.dict())
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.put("/sql/chapters/{chapter_id}", response_model=schemas.SQLChapter)
def update_sql_chapter(chapter_id: int, chapter: schemas.SQLChapterUpdate, db: Session = Depends(database.get_db)):
    db_chapter = db.query(models.SQLChapter).filter(models.SQLChapter.id == chapter_id).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    update_data = chapter.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_chapter, key, value)
            
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.delete("/sql/chapters/{chapter_id}")
def delete_sql_chapter(chapter_id: int, db: Session = Depends(database.get_db)):
    db_chapter = db.query(models.SQLChapter).filter(models.SQLChapter.id == chapter_id).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    db.delete(db_chapter)
    db.commit()
    return {"message": "Chapter deleted successfully"}


@router.post("/sql/problems", response_model=schemas.SQLProblem)
def create_sql_problem(problem: schemas.SQLProblemCreate, db: Session = Depends(database.get_db)):
    db_problem = models.SQLProblem(**problem.dict())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.put("/sql/problems/{problem_id}", response_model=schemas.SQLProblem)
def update_sql_problem(problem_id: int, problem: schemas.SQLProblemUpdate, db: Session = Depends(database.get_db)):
    db_problem = db.query(models.SQLProblem).filter(models.SQLProblem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    update_data = problem.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_problem, key, value)
            
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/sql/problems/{problem_id}")
def delete_sql_problem(problem_id: int, db: Session = Depends(database.get_db)):
    db_problem = db.query(models.SQLProblem).filter(models.SQLProblem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    db.delete(db_problem)
    db.commit()
    return {"message": "Problem deleted successfully"}


# ==========================================
# Aptitude Chapters & Problems Management
# ==========================================

@router.post("/aptitude/chapters", response_model=schemas.AptitudeChapter)
def create_aptitude_chapter(chapter: schemas.AptitudeChapterCreate, db: Session = Depends(database.get_db)):
    db_chapter = models.AptitudeChapter(**chapter.dict())
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.put("/aptitude/chapters/{chapter_id}", response_model=schemas.AptitudeChapter)
def update_aptitude_chapter(chapter_id: int, chapter: schemas.AptitudeChapterUpdate, db: Session = Depends(database.get_db)):
    db_chapter = db.query(models.AptitudeChapter).filter(models.AptitudeChapter.id == chapter_id).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    update_data = chapter.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_chapter, key, value)
            
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.delete("/aptitude/chapters/{chapter_id}")
def delete_aptitude_chapter(chapter_id: int, db: Session = Depends(database.get_db)):
    db_chapter = db.query(models.AptitudeChapter).filter(models.AptitudeChapter.id == chapter_id).first()
    if not db_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    db.delete(db_chapter)
    db.commit()
    return {"message": "Chapter deleted successfully"}


@router.post("/aptitude/problems", response_model=schemas.AptitudeProblem)
def create_aptitude_problem(problem: schemas.AptitudeProblemCreate, db: Session = Depends(database.get_db)):
    db_problem = models.AptitudeProblem(**problem.dict())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.put("/aptitude/problems/{problem_id}", response_model=schemas.AptitudeProblem)
def update_aptitude_problem(problem_id: int, problem: schemas.AptitudeProblemUpdate, db: Session = Depends(database.get_db)):
    db_problem = db.query(models.AptitudeProblem).filter(models.AptitudeProblem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    update_data = problem.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_problem, key, value)
            
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/aptitude/problems/{problem_id}")
def delete_aptitude_problem(problem_id: int, db: Session = Depends(database.get_db)):
    db_problem = db.query(models.AptitudeProblem).filter(models.AptitudeProblem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    db.delete(db_problem)
    db.commit()
    return {"message": "Problem deleted successfully"}
