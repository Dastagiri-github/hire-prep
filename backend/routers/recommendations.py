from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, database, models, dependencies
import random

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)

@router.get("/", response_model=schemas.Problem)
def get_recommendation(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    user_stats = current_user.stats
    weak_topics = []
    if "topics" in user_stats:
        for topic, data in user_stats["topics"].items():
            if data.get("accuracy", 0) < 50:
                weak_topics.append(topic)
    
    target_companies = current_user.target_companies
    
    all_problems = crud.get_problems(db)
    
    if not all_problems:
        raise HTTPException(status_code=404, detail="No problems available")

    candidates = []
    for p in all_problems:
        score = 0
        if any(t in weak_topics for t in p.tags):
            score += 2
        if any(c in target_companies for c in p.companies):
            score += 1
            
        if score > 0:
            candidates.append(p)
            
    if candidates:
        return random.choice(candidates)
        
    return random.choice(all_problems)

@router.get("/next", response_model=schemas.Problem)
def get_next_recommendation(
    failed_problem_id: int,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Get the failed problem to find its tags
    failed_problem = crud.get_problem(db, failed_problem_id)
    if not failed_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    tags = failed_problem.tags
    
    # 2. Get IDs of solved problems to exclude them
    solved_ids = {s.problem_id for s in current_user.submissions if s.status == "Accepted"}
    
    # 3. Find candidates
    # Criteria: Same Tag, Easy Difficulty (to build confidence), Not Solved, Not the same problem
    all_problems = crud.get_problems(db)
    candidates = []
    
    for p in all_problems:
        if p.id == failed_problem_id:
            continue
        if p.id in solved_ids:
            continue
            
        # Check for tag overlap
        if any(t in tags for t in p.tags):
            # Prefer Easy problems
            if p.difficulty == "Easy":
                candidates.append(p)
    
    if not candidates:
        # Fallback: Any Easy problem not solved
        for p in all_problems:
            if p.id != failed_problem_id and p.id not in solved_ids and p.difficulty == "Easy":
                candidates.append(p)
                
    if not candidates:
         raise HTTPException(status_code=404, detail="No suitable recommendation found")
         
    return random.choice(candidates)

