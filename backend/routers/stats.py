from datetime import date, datetime, timedelta
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

import database
import dependencies
import models
import schemas

router = APIRouter(
    prefix="/stats",
    tags=["stats"],
)


@router.post("/ping")
def update_user_activity(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    """
    Called periodically by the frontend when the user is active on the platform.
    Updates the user's last_active_at and increments time_spent_seconds for today.
    """
    now = datetime.utcnow()
    today = now.date()

    # Update last active time
    current_user.last_active_at = now
    db.add(current_user)

    # Update or create daily activity record
    # Assuming the ping interval is roughly 30 seconds
    PING_INTERVAL_SECONDS = 30

    daily_activity = (
        db.query(models.UserDailyActivity)
        .filter(
            models.UserDailyActivity.user_id == current_user.id,
            models.UserDailyActivity.date == today,
        )
        .first()
    )

    if not daily_activity:
        daily_activity = models.UserDailyActivity(
            user_id=current_user.id, date=today, time_spent_seconds=0
        )
        db.add(daily_activity)

    daily_activity.time_spent_seconds += PING_INTERVAL_SECONDS
    db.commit()

    return {"status": "success", "time_spent_today": daily_activity.time_spent_seconds}


@router.get("/user", response_model=schemas.UserComprehensiveStats)
def get_user_stats(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    """Get comprehensive stats for the current authenticated user"""
    user_id = current_user.id

    # 1. Total Solved & Difficulty Breakdown
    # Using UserPerformanceLog for a comprehensive view across coding, sql, aptitude
    performance_logs = (
        db.query(models.UserPerformanceLog)
        .filter(
            models.UserPerformanceLog.user_id == user_id,
            models.UserPerformanceLog.status.in_(["Accepted", "Correct"])
        )
        .all()
    )

    solved_problems = set() # (problem_type, problem_id)
    difficulty_breakdown = {"Easy": 0, "Medium": 0, "Hard": 0}
    topic_counts = {}
    
    # Pre-fetch tags for problems since performance_logs tags might be empty/snapshot based
    # Optimization: Only load tags for problems the user actually solved
    solved_coding_ids = [log.problem_id for log in performance_logs if log.problem_type == "coding"]
    coding_problems = {}
    if solved_coding_ids:
        # Batch fetch only needed tags to prevent dumping entire Problem table into memory
        fetched_problems = db.query(models.Problem.id, models.Problem.tags).filter(
            models.Problem.id.in_(solved_coding_ids)
        ).all()
        coding_problems = {pid: tags for pid, tags in fetched_problems}

    for log in performance_logs:
        prob_key = (log.problem_type, log.problem_id)
        if prob_key not in solved_problems:
            solved_problems.add(prob_key)
            
            # Difficulty
            difficulty = log.difficulty or "Medium" # Fallback
            if difficulty in difficulty_breakdown:
                difficulty_breakdown[difficulty] += 1
            else:
                 difficulty_breakdown[difficulty] = 1

            # Topics/Tags
            if log.problem_type == "coding":
                tags = log.tags or coding_problems.get(log.problem_id, [])
                for tag in tags:
                    topic_counts[tag] = topic_counts.get(tag, 0) + 1
            elif log.problem_type == "sql":
                topic_counts["SQL"] = topic_counts.get("SQL", 0) + 1
            elif log.problem_type == "aptitude":
                topic_counts["Aptitude"] = topic_counts.get("Aptitude", 0) + 1


    total_solved = len(solved_problems)

    # 2. Topic Radar
    topic_radar = []
    # If no topics, provide some default shape
    if not topic_counts:
        topic_radar = [
            {"subject": "Arrays", "A": 0, "fullMark": 10},
            {"subject": "Strings", "A": 0, "fullMark": 10},
            {"subject": "SQL", "A": 0, "fullMark": 10},
            {"subject": "Math", "A": 0, "fullMark": 10},
            {"subject": "DP", "A": 0, "fullMark": 10},
        ]
    else:
        topic_radar = [
            {"subject": tag, "A": count, "fullMark": max(10, count + 5)}
            for tag, count in topic_counts.items()
        ]
        topic_radar = sorted(topic_radar, key=lambda x: x["A"], reverse=True)[:6]

    # 3. Time Spent
    total_time_spent = db.query(func.sum(models.UserDailyActivity.time_spent_seconds)).filter(
        models.UserDailyActivity.user_id == user_id
    ).scalar() or 0

    # 4. Activity Graph (Heatmap) & Streaks
    today = datetime.utcnow().date()
    activity_data = []
    
    # Initialize last 365 days for heatmap
    date_map = {}
    for i in range(365):
        d = today - timedelta(days=i) # Last 365 days
        date_map[d.isoformat()] = 0
        
    for log in performance_logs:
        d_str = log.submitted_at.date().isoformat()
        if d_str in date_map:
            date_map[d_str] += 1
            
    # Calculate Streaks based on date_map
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    dates_sorted_desc = sorted(date_map.keys(), reverse=True)
    
    # Check current streak starting from today or yesterday
    if date_map.get(today.isoformat(), 0) > 0 or date_map.get((today - timedelta(days=1)).isoformat(), 0) > 0:
        for d_str in dates_sorted_desc:
            if date_map[d_str] > 0:
                current_streak += 1
            elif d_str == today.isoformat():
                continue # It's okay if today is 0 as long as yesterday was > 0
            else:
                break
                
    # Calculate longest streak
    for d_str in sorted(date_map.keys()): # Ascending for longest streak
        if date_map[d_str] > 0:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 0

    for d_str in sorted(date_map.keys()):
        activity_data.append({"date": d_str, "count": date_map[d_str]})

    # 5. Global Percentile
    total_users = db.query(models.User).count()
    if total_users > 1:
        # Assuming reputation or total solved is the metric. 
        # For simplicity, using total_solved proxy if reputation is all 0
        # This is a bit heavy, real world we wouldn't calculate this dynamically every request.
        global_percentile = 50.0 # Placeholder
    else:
        global_percentile = 100.0

    # 6. Recent Submissions
    recent_logs = (
        db.query(models.UserPerformanceLog)
        .filter(models.UserPerformanceLog.user_id == user_id)
        .order_by(models.UserPerformanceLog.submitted_at.desc())
        .limit(10)
        .all()
    )
    
    # Optimization: Batch fetch problem titles
    prob_ids_by_type = {"coding": set(), "sql": set(), "aptitude": set()}
    for log in recent_logs:
        if log.problem_type in prob_ids_by_type:
            prob_ids_by_type[log.problem_type].add(log.problem_id)
            
    title_map = {"coding": {}, "sql": {}, "aptitude": {}}
    if prob_ids_by_type["coding"]:
        cp = db.query(models.Problem.id, models.Problem.title).filter(models.Problem.id.in_(prob_ids_by_type["coding"])).all()
        title_map["coding"] = {pid: title for pid, title in cp}
    if prob_ids_by_type["sql"]:
        sp = db.query(models.SQLProblem.id, models.SQLProblem.title).filter(models.SQLProblem.id.in_(prob_ids_by_type["sql"])).all()
        title_map["sql"] = {pid: title for pid, title in sp}
    if prob_ids_by_type["aptitude"]:
        ap = db.query(models.AptitudeProblem.id, models.AptitudeProblem.title).filter(models.AptitudeProblem.id.in_(prob_ids_by_type["aptitude"])).all()
        title_map["aptitude"] = {pid: title for pid, title in ap}
    
    recent_submissions = []
    for log in recent_logs:
        title = title_map.get(log.problem_type, {}).get(log.problem_id, "Unknown Problem")

        recent_submissions.append({
            "id": log.id,
            "problem_id": log.problem_id,
            "title": title,
            "difficulty": log.difficulty or "Unknown",
            "problem_type": log.problem_type,
            "status": log.status,
            "time_spent_seconds": log.time_spent_seconds,
            "submitted_at": log.submitted_at
        })

    # 7. Badges
    badges = db.query(models.UserBadge).filter(models.UserBadge.user_id == user_id).all()
    badge_list = [{"id": b.id, "badge_name": b.badge_name, "earned_at": b.earned_at} for b in badges]

    return {
        "total_solved": total_solved,
        "total_time_spent_seconds": total_time_spent,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "reputation": current_user.reputation,
        "global_percentile": global_percentile,
        "difficulty_breakdown": difficulty_breakdown,
        "topic_radar": topic_radar,
        "activity_graph": activity_data,
        "recent_submissions": recent_submissions,
        "badges": badge_list,
    }

@router.get("/leaderboard", response_model=List[schemas.LeaderboardUser])
def get_leaderboard(
    limit: int = 50,
    db: Session = Depends(database.get_db),
):
    """Get the global leaderboard ordered by reputation"""
    users = db.query(models.User).order_by(models.User.reputation.desc()).limit(limit).all()
    
    leaderboard = []
    for u in users:
         leaderboard.append({
             "id": u.id,
             "name": u.name or u.username,
             "username": u.username,
             "reputation": u.reputation,
             "total_solved": 0, # Placeholder
             "current_streak": 0 # Placeholder
         })
         
    return leaderboard


