from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import database
import schemas

router = APIRouter(
    prefix="/problems",
    tags=["problems"],
)


@router.post("/", response_model=schemas.Problem)
def create_problem(
    problem: schemas.ProblemCreate, db: Session = Depends(database.get_db)
):
    return crud.create_problem(db=db, problem=problem)


@router.get("/", response_model=List[schemas.Problem])
def read_problems(
    skip: int = 0, limit: int = 1000, db: Session = Depends(database.get_db)
):
    problems = crud.get_problems(db, skip=skip, limit=limit)
    return problems


@router.get("/{problem_id}", response_model=schemas.Problem)
def read_problem(problem_id: int, db: Session = Depends(database.get_db)):
    db_problem = crud.get_problem(db, problem_id=problem_id)
    if db_problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    return db_problem


@router.get("/companies/list", response_model=List[dict])
def get_companies(db: Session = Depends(database.get_db)):
    # Aggregate companies from all problems
    problems = crud.get_problems(db, limit=1000)
    company_stats = {}

    for p in problems:
        for company in p.companies:
            if company not in company_stats:
                company_stats[company] = {"name": company, "count": 0, "problems": []}
            company_stats[company]["count"] += 1
            company_stats[company]["problems"].append(p)

    return [{"name": k, "count": v["count"]} for k, v in company_stats.items()]


@router.get("/companies/{company_name}", response_model=List[schemas.Problem])
def get_company_problems(company_name: str, db: Session = Depends(database.get_db)):
    problems = crud.get_problems(db, limit=1000)
    filtered = [p for p in problems if company_name in p.companies]
    return filtered


# ==========================================
# Daily Challenge
# ==========================================

from datetime import datetime
import dependencies
import models

@router.get("/daily", response_model=schemas.DailyChallengeResponse)
def get_daily_challenge(db: Session = Depends(database.get_db)):
    today = datetime.utcnow().date()
    challenge = db.query(models.DailyChallenge).filter(models.DailyChallenge.date == today).first()
    
    if not challenge:
        raise HTTPException(status_code=404, detail="No challenge assigned for today yet")
        
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
        "date": challenge.date,
        "problem_id": challenge.problem_id,
        "problem_type": challenge.problem_type,
        "title": title,
        "difficulty": difficulty,
        "description": description
    }

@router.get("/daily/status", response_model=schemas.DailyChallengeStatus)
def get_daily_challenge_status(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    today = datetime.utcnow().date()
    challenge = db.query(models.DailyChallenge).filter(models.DailyChallenge.date == today).first()
    
    if not challenge:
        return {"solved": False, "status": "No Challenge"}
        
    # Check if user solved it today
    # Because we store submitted_at as DateTime, we need to carefully match today's date
    log = db.query(models.UserPerformanceLog).filter(
        models.UserPerformanceLog.user_id == current_user.id,
        models.UserPerformanceLog.problem_id == challenge.problem_id,
        models.UserPerformanceLog.problem_type == challenge.problem_type,
        models.UserPerformanceLog.status.in_(["Accepted", "Correct"])
    ).order_by(models.UserPerformanceLog.submitted_at.desc()).first()
    
    if log and log.submitted_at.date() == today:
        return {"solved": True, "status": log.status}
        
    return {"solved": False, "status": "Not Solved"}
