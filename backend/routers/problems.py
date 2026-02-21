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
