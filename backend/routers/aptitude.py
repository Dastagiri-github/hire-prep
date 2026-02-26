from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import database
import models
import schemas
from dependencies import get_current_user_optional

router = APIRouter(
    prefix="/aptitude",
    tags=["aptitude"],
)


# --- Chapters ---

@router.post("/chapters", response_model=schemas.AptitudeChapter)
def create_chapter(
    chapter: schemas.AptitudeChapterCreate, db: Session = Depends(database.get_db)
):
    db_chapter = models.AptitudeChapter(**chapter.dict())
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.get("/chapters", response_model=List[schemas.AptitudeChapter])
def get_chapters(db: Session = Depends(database.get_db)):
    chapters = db.query(models.AptitudeChapter).order_by(models.AptitudeChapter.order).all()

    difficulty_map = {"Easy": 1, "Medium": 2, "Hard": 3}
    for chapter in chapters:
        # Sort problems in-place for the response
        chapter.problems.sort(key=lambda p: difficulty_map.get(p.difficulty, 4))

    return chapters


@router.get("/chapters/{chapter_id}", response_model=schemas.AptitudeChapter)
def get_chapter(chapter_id: int, db: Session = Depends(database.get_db)):
    chapter = (
        db.query(models.AptitudeChapter)
        .filter(models.AptitudeChapter.id == chapter_id)
        .first()
    )
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


# --- Problems ---

@router.post("/problems", response_model=schemas.AptitudeProblem)
def create_problem(
    problem: schemas.AptitudeProblemCreate, db: Session = Depends(database.get_db)
):
    db_problem = models.AptitudeProblem(**problem.dict())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.get("/problems/{problem_id}", response_model=schemas.AptitudeProblem)
def get_problem(problem_id: int, db: Session = Depends(database.get_db)):
    problem = (
        db.query(models.AptitudeProblem)
        .filter(models.AptitudeProblem.id == problem_id)
        .first()
    )
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Hide correct answer and explanation from the response
    problem.correct_answer = ""
    problem.explanation = ""
    
    return problem


# --- Evaluation ---

@router.post("/evaluate", response_model=schemas.AptitudeEvaluationResult)
def evaluate_aptitude_answer(
    request: schemas.AptitudeSubmissionRequest,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    problem = (
        db.query(models.AptitudeProblem)
        .filter(models.AptitudeProblem.id == request.problem_id)
        .first()
    )
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Evaluate the answer
    is_correct = str(request.selected_answer).strip() == str(problem.correct_answer).strip()
    
    # For numerical answers, allow some tolerance for floating point
    if problem.question_type == "NUMERICAL":
        try:
            user_answer = float(request.selected_answer)
            correct_answer = float(problem.correct_answer)
            is_correct = abs(user_answer - correct_answer) < 0.01  # 0.01 tolerance
        except ValueError:
            is_correct = False

    result = schemas.AptitudeEvaluationResult(
        is_correct=is_correct,
        correct_answer=problem.correct_answer,
        explanation=problem.explanation,
        user_answer=request.selected_answer,
    )

    return result


@router.get("/problems", response_model=List[schemas.AptitudeProblem])
def get_all_problems(db: Session = Depends(database.get_db)):
    problems = db.query(models.AptitudeProblem).all()
    
    # Hide correct answers and explanations from the response
    for problem in problems:
        problem.correct_answer = ""
        problem.explanation = ""
    
    return problems
