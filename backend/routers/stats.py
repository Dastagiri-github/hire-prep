from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, database, models, dependencies
from sqlalchemy import func

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
)

@router.get("/user/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Ensure user can only view their own stats or is admin (omitted for now)
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these stats")
        
    # 1. Topic Breakdown
    # We need to join Submissions with Problems to get tags
    # This is a bit complex with JSON tags in SQLite/SQLAlchemy without specific JSON operators in some versions
    # So we will do it in Python for now (less efficient but works for MVP)
    
    submissions = db.query(models.Submission).filter(
        models.Submission.user_id == user_id,
        models.Submission.status == "Accepted"
    ).all()
    
    # Get unique solved problem IDs to avoid double counting
    solved_problem_ids = set()
    topic_counts = {}
    
    for sub in submissions:
        if sub.problem_id in solved_problem_ids:
            continue
        solved_problem_ids.add(sub.problem_id)
        
        # Get problem tags
        problem = sub.problem
        if problem and problem.tags:
            for tag in problem.tags:
                topic_counts[tag] = topic_counts.get(tag, 0) + 1
                
    topic_data = [{"subject": tag, "A": count, "fullMark": 10} for tag, count in topic_counts.items()]
    
    # 2. Activity Graph (Last 30 days)
    # Group submissions by date
    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    activity_data = []
    
    # Initialize last 30 days with 0
    date_map = {}
    for i in range(30):
        d = today - timedelta(days=i)
        date_map[d.isoformat()] = 0
        
    all_submissions = db.query(models.Submission).filter(models.Submission.user_id == user_id).all()
    for sub in all_submissions:
        d_str = sub.submitted_at.date().isoformat()
        if d_str in date_map:
            date_map[d_str] += 1
            
    # Convert to list sorted by date
    for d_str in sorted(date_map.keys()):
        activity_data.append({"date": d_str, "count": date_map[d_str]})
        
    return {
        "topic_radar": topic_data,
        "activity_graph": activity_data,
        "total_solved": len(solved_problem_ids)
    }
