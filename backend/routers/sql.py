from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import database, models, schemas
from sql_executor import execute_sql_problem, get_tables_from_setup
from dependencies import get_current_user, get_current_user_optional

router = APIRouter(
    prefix="/sql",
    tags=["sql"],
)

# --- Chapters ---

@router.post("/chapters", response_model=schemas.SQLChapter)
def create_chapter(chapter: schemas.SQLChapterCreate, db: Session = Depends(database.get_db)):
    db_chapter = models.SQLChapter(**chapter.dict())
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter

@router.get("/chapters", response_model=List[schemas.SQLChapter])
def get_chapters(db: Session = Depends(database.get_db)):
    chapters = db.query(models.SQLChapter).order_by(models.SQLChapter.order).all()
    
    difficulty_map = {"Easy": 1, "Medium": 2, "Hard": 3}
    for chapter in chapters:
        # Sort problems in-place for the response
        chapter.problems.sort(key=lambda p: difficulty_map.get(p.difficulty, 4))
        
    return chapters

@router.get("/chapters/{chapter_id}", response_model=schemas.SQLChapter)
def get_chapter(chapter_id: int, db: Session = Depends(database.get_db)):
    chapter = db.query(models.SQLChapter).filter(models.SQLChapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

# --- Problems ---

@router.post("/problems", response_model=schemas.SQLProblem)
def create_problem(problem: schemas.SQLProblemCreate, db: Session = Depends(database.get_db)):
    db_problem = models.SQLProblem(**problem.dict())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

@router.get("/problems/{problem_id}", response_model=schemas.SQLProblem)
def get_problem(problem_id: int, db: Session = Depends(database.get_db)):
    problem = db.query(models.SQLProblem).filter(models.SQLProblem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Populate tables from setup_sql
    problem.tables = get_tables_from_setup(problem.setup_sql)
    
    return problem

# --- Execution ---

@router.post("/run", response_model=schemas.SQLExecutionResult)
def run_sql(
    request: schemas.SQLExecutionRequest, 
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    problem = db.query(models.SQLProblem).filter(models.SQLProblem.id == request.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    result = execute_sql_problem(problem.setup_sql, problem.solution_sql, request.user_query)
    
    # Record submission if successful (or even if failed, but let's track attempts)
    # For now, let's just record it.
    status = "Correct" if result["success"] else "Incorrect"
    
    if current_user:
        submission = models.SQLSubmission(
            user_id=current_user.id,
            problem_id=problem.id,
            query=request.user_query,
            status=status
        )
        db.add(submission)
        db.commit()
    
    return result

@router.get("/user/progress", response_model=List[schemas.SQLSubmission])
def get_user_sql_progress(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # Return all correct submissions for the user to track progress
    return db.query(models.SQLSubmission).filter(
        models.SQLSubmission.user_id == current_user.id,
        models.SQLSubmission.status == "Correct"
    ).all()

