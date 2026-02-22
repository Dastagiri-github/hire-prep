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
    
    return {
        "users": user_count,
        "problems": problem_count,
        "submissions": submission_count,
        "sql_problems": sql_problem_count
    }


# ==========================================
# DSA Problems Management
# ==========================================

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
