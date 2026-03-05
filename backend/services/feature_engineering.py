"""
Feature Engineering Service
Builds user skill profiles from UserPerformanceLog entries for ML recommendations.
"""

from collections import defaultdict
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

import models


def get_user_performance_logs(
    db: Session, user_id: int, problem_type: Optional[str] = None
) -> List[models.UserPerformanceLog]:
    """Retrieve all performance logs for a user, optionally filtered by type."""
    query = db.query(models.UserPerformanceLog).filter(
        models.UserPerformanceLog.user_id == user_id
    )
    if problem_type:
        query = query.filter(models.UserPerformanceLog.problem_type == problem_type)
    return query.order_by(models.UserPerformanceLog.submitted_at.desc()).all()


def build_user_profile(db: Session, user_id: int) -> Dict:
    """
    Build a comprehensive skill profile from a user's performance history.
    Returns a dict with all ML-relevant features.
    """
    logs = get_user_performance_logs(db, user_id)

    if not logs:
        return {
            "tag_accuracy": {},
            "difficulty_accuracy": {"Easy": 0.0, "Medium": 0.0, "Hard": 0.0},
            "tag_attempt_avg": {},
            "recent_streak": 0,
            "total_problems_attempted": 0,
            "weak_tags": [],
            "strong_tags": [],
            "recommended_difficulty": "Easy",
            "problem_type_breakdown": {},
        }

    # --- Tag-level accuracy ---
    tag_results = defaultdict(lambda: {"correct": 0, "total": 0})
    for log in logs:
        for tag in (log.tags or []):
            tag_results[tag]["total"] += 1
            if log.status in ("Accepted", "Correct"):
                tag_results[tag]["correct"] += 1

    tag_accuracy = {}
    for tag, data in tag_results.items():
        tag_accuracy[tag] = data["correct"] / data["total"] if data["total"] > 0 else 0.0

    # --- Difficulty-level accuracy ---
    diff_results = defaultdict(lambda: {"correct": 0, "total": 0})
    for log in logs:
        diff = log.difficulty or "Easy"
        diff_results[diff]["total"] += 1
        if log.status in ("Accepted", "Correct"):
            diff_results[diff]["correct"] += 1

    difficulty_accuracy = {}
    for diff in ("Easy", "Medium", "Hard"):
        data = diff_results[diff]
        difficulty_accuracy[diff] = data["correct"] / data["total"] if data["total"] > 0 else 0.0

    # --- Average attempts per tag ---
    tag_attempts = defaultdict(list)
    # Group by (problem_id, problem_type) to get max attempt per problem per tag
    problem_max_attempts = defaultdict(int)
    problem_tags_map = {}
    for log in logs:
        key = (log.problem_id, log.problem_type)
        problem_max_attempts[key] = max(problem_max_attempts[key], log.attempt_number)
        problem_tags_map[key] = log.tags or []

    for key, max_attempts in problem_max_attempts.items():
        for tag in problem_tags_map.get(key, []):
            tag_attempts[tag].append(max_attempts)

    tag_attempt_avg = {}
    for tag, attempts in tag_attempts.items():
        tag_attempt_avg[tag] = sum(attempts) / len(attempts) if attempts else 1.0

    # --- Recent streak (last 10 submissions) ---
    recent_logs = sorted(logs, key=lambda l: l.submitted_at, reverse=True)[:10]
    recent_streak = 0
    for log in recent_logs:
        if log.status in ("Accepted", "Correct"):
            recent_streak += 1
        else:
            break

    # --- Total unique problems attempted ---
    unique_problems = set()
    for log in logs:
        unique_problems.add((log.problem_id, log.problem_type))
    total_problems_attempted = len(unique_problems)

    # --- Weak / Strong tags ---
    weak_tags = [tag for tag, acc in tag_accuracy.items() if acc < 0.5]
    strong_tags = [tag for tag, acc in tag_accuracy.items() if acc >= 0.8]

    # --- Recommended difficulty (Zone of Proximal Development) ---
    recommended_difficulty = _compute_zpd_difficulty(difficulty_accuracy)

    # --- Problem type breakdown ---
    type_counts = defaultdict(int)
    for log in logs:
        type_counts[log.problem_type] += 1

    return {
        "tag_accuracy": tag_accuracy,
        "difficulty_accuracy": difficulty_accuracy,
        "tag_attempt_avg": tag_attempt_avg,
        "recent_streak": recent_streak,
        "total_problems_attempted": total_problems_attempted,
        "weak_tags": weak_tags,
        "strong_tags": strong_tags,
        "recommended_difficulty": recommended_difficulty,
        "problem_type_breakdown": dict(type_counts),
    }


def _compute_zpd_difficulty(difficulty_accuracy: Dict[str, float]) -> str:
    """
    Zone of Proximal Development logic:
    - If Easy accuracy >= 80% → suggest Medium
    - If Medium accuracy >= 80% → suggest Hard
    - If Medium accuracy 50-80% → stay Medium
    - If Medium accuracy < 50% → drop to Easy
    - Default: Easy
    """
    easy_acc = difficulty_accuracy.get("Easy", 0.0)
    medium_acc = difficulty_accuracy.get("Medium", 0.0)
    hard_acc = difficulty_accuracy.get("Hard", 0.0)

    if medium_acc >= 0.8:
        return "Hard"
    elif easy_acc >= 0.8:
        if medium_acc >= 0.5:
            return "Medium"
        else:
            return "Medium"  # Push to try Medium
    elif easy_acc >= 0.5:
        return "Easy"
    else:
        return "Easy"
