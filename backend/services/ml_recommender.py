"""
ML-Based Recommendation Engine
Scores unsolved problems based on user performance profile, tag similarity,
difficulty appropriateness (ZPD), and company relevance.
"""

from collections import defaultdict
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

import models
from services.feature_engineering import build_user_profile
from services.similarity_engine import similarity_engine


# Tunable weights for the scoring function
WEIGHTS = {
    "tag_weakness": 3.0,      # Prioritize weak areas
    "difficulty_zpd": 2.5,    # Zone of Proximal Development match
    "similarity_to_failed": 2.0,  # Similar to recently failed problems
    "company_relevance": 1.5,  # Target company match
    "recency_penalty": -1.0,  # Don't repeat same tags too much
    "unsolved_bonus": 1.0,    # Bonus for never-attempted problems
}


def get_recommendations(
    db: Session,
    user_id: int,
    top_n: int = 5,
    problem_type: Optional[str] = None,
) -> List[Dict]:
    """
    Generate top-N problem recommendations for a user.
    Returns list of dicts: [{"problem": Problem, "score": float, "reason": str}, ...]
    """
    # 1. Build user profile
    profile = build_user_profile(db, user_id)

    # 2. Get the user object for target companies
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return []

    target_companies = user.target_companies or []

    # 3. Get all problems
    all_problems = db.query(models.Problem).all()
    if not all_problems:
        return []

    # 4. Get solved problem IDs
    solved_ids = set()
    accepted_subs = (
        db.query(models.Submission)
        .filter(
            models.Submission.user_id == user_id,
            models.Submission.status == "Accepted",
        )
        .all()
    )
    for sub in accepted_subs:
        solved_ids.add(sub.problem_id)

    # 5. Get recently failed problem IDs (last 5)
    recent_failed = (
        db.query(models.UserPerformanceLog)
        .filter(
            models.UserPerformanceLog.user_id == user_id,
            models.UserPerformanceLog.problem_type == "coding",
            models.UserPerformanceLog.status != "Accepted",
        )
        .order_by(models.UserPerformanceLog.submitted_at.desc())
        .limit(5)
        .all()
    )
    recently_failed_ids = [log.problem_id for log in recent_failed]

    # 6. Get recently practiced tags (for recency penalty)
    recent_logs = (
        db.query(models.UserPerformanceLog)
        .filter(
            models.UserPerformanceLog.user_id == user_id,
            models.UserPerformanceLog.problem_type == "coding",
        )
        .order_by(models.UserPerformanceLog.submitted_at.desc())
        .limit(10)
        .all()
    )
    recent_tag_counts = defaultdict(int)
    for log in recent_logs:
        for tag in (log.tags or []):
            recent_tag_counts[tag] += 1

    # 7. Ensure similarity engine is initialized
    similarity_engine.initialize(db)

    # 8. Score each unsolved problem
    scored_problems = []
    recommended_difficulty = profile.get("recommended_difficulty", "Easy")
    weak_tags = set(profile.get("weak_tags", []))
    tag_accuracy = profile.get("tag_accuracy", {})

    for problem in all_problems:
        if problem.id in solved_ids:
            continue

        score = 0.0
        reasons = []

        # --- Tag weakness match ---
        problem_tags = set(problem.tags or [])
        weak_overlap = problem_tags & weak_tags
        if weak_overlap:
            score += WEIGHTS["tag_weakness"] * len(weak_overlap)
            reasons.append(f"Strengthens weak area: {', '.join(weak_overlap)}")

        # --- Difficulty ZPD match ---
        diff_score = _difficulty_zpd_score(problem.difficulty, recommended_difficulty)
        score += WEIGHTS["difficulty_zpd"] * diff_score
        if diff_score > 0.5:
            reasons.append(f"Matches your skill level ({problem.difficulty})")

        # --- Similarity to recently failed problems ---
        if recently_failed_ids:
            max_sim = 0.0
            for failed_id in recently_failed_ids:
                similar = similarity_engine.get_similar_problems(db, failed_id, top_n=20)
                for pid, sim in similar:
                    if pid == problem.id:
                        max_sim = max(max_sim, sim)
                        break
            if max_sim > 0:
                score += WEIGHTS["similarity_to_failed"] * max_sim
                reasons.append("Related to a problem you're working on")

        # --- Company relevance ---
        problem_companies = set(problem.companies or [])
        company_overlap = problem_companies & set(target_companies)
        if company_overlap:
            score += WEIGHTS["company_relevance"] * len(company_overlap)
            reasons.append(f"Asked by: {', '.join(company_overlap)}")

        # --- Recency penalty (avoid tag repetition) ---
        recency_score = 0
        for tag in problem_tags:
            recency_score += recent_tag_counts.get(tag, 0)
        score += WEIGHTS["recency_penalty"] * (recency_score / max(len(problem_tags), 1))

        # --- Unsolved bonus ---
        attempted_ids = set()
        for log in recent_logs:
            attempted_ids.add(log.problem_id)
        if problem.id not in attempted_ids:
            score += WEIGHTS["unsolved_bonus"]

        if not reasons:
            reasons.append("Recommended for practice")

        scored_problems.append({
            "problem": problem,
            "score": round(score, 2),
            "reason": reasons[0] if reasons else "Recommended for practice",
            "reasons": reasons,
        })

    # 9. Sort by score descending and return top N
    scored_problems.sort(key=lambda x: x["score"], reverse=True)
    return scored_problems[:top_n]


def get_next_after_failure(
    db: Session,
    user_id: int,
    failed_problem_id: int,
) -> Optional[Dict]:
    """
    After a user fails a problem, recommend the best next problem
    based on similarity + difficulty de-escalation.
    """
    failed_problem = db.query(models.Problem).filter(models.Problem.id == failed_problem_id).first()
    if not failed_problem:
        return None

    profile = build_user_profile(db, user_id)

    # Get solved IDs to exclude
    solved_ids = set()
    accepted_subs = (
        db.query(models.Submission)
        .filter(
            models.Submission.user_id == user_id,
            models.Submission.status == "Accepted",
        )
        .all()
    )
    for sub in accepted_subs:
        solved_ids.add(sub.problem_id)
    solved_ids.add(failed_problem_id)

    # Get similar problems
    similarity_engine.initialize(db)
    similar = similarity_engine.get_similar_problems(
        db, failed_problem_id, top_n=20, exclude_ids=solved_ids
    )

    if not similar:
        # Fallback to general recommendations
        recs = get_recommendations(db, user_id, top_n=1)
        return recs[0] if recs else None

    # Prefer problems at same or lower difficulty
    difficulty_order = {"Easy": 0, "Medium": 1, "Hard": 2}
    failed_diff = difficulty_order.get(failed_problem.difficulty, 0)

    best_match = None
    best_score = -1

    for pid, sim_score in similar:
        problem = db.query(models.Problem).filter(models.Problem.id == pid).first()
        if not problem:
            continue

        prob_diff = difficulty_order.get(problem.difficulty, 0)

        # Prefer same or easier difficulty after failure
        if prob_diff <= failed_diff:
            adjusted_score = sim_score * 1.5
        else:
            adjusted_score = sim_score * 0.5

        if adjusted_score > best_score:
            best_score = adjusted_score
            best_match = problem

    if best_match:
        reason = f"Similar to '{failed_problem.title}' but at {best_match.difficulty} level"
        return {
            "problem": best_match,
            "score": round(best_score, 2),
            "reason": reason,
        }

    return None


def get_learning_path(
    db: Session,
    user_id: int,
    focus_tags: Optional[List[str]] = None,
    path_length: int = 10,
) -> List[Dict]:
    """
    Generate an ordered learning path: a sequence of problems
    that progressively builds skill in weak areas.
    """
    profile = build_user_profile(db, user_id)

    # Determine focus areas
    if not focus_tags:
        focus_tags = profile.get("weak_tags", [])
        if not focus_tags:
            # No weak tags — pick tags with fewest problems solved
            tag_accuracy = profile.get("tag_accuracy", {})
            if tag_accuracy:
                sorted_tags = sorted(tag_accuracy.items(), key=lambda x: x[1])
                focus_tags = [t[0] for t in sorted_tags[:3]]

    # Get solved IDs
    solved_ids = set()
    accepted_subs = (
        db.query(models.Submission)
        .filter(
            models.Submission.user_id == user_id,
            models.Submission.status == "Accepted",
        )
        .all()
    )
    for sub in accepted_subs:
        solved_ids.add(sub.problem_id)

    # Get all problems matching focus tags
    all_problems = db.query(models.Problem).all()
    candidates = []
    for problem in all_problems:
        if problem.id in solved_ids:
            continue
        problem_tags = set(problem.tags or [])
        if focus_tags and problem_tags & set(focus_tags):
            candidates.append(problem)

    if not candidates:
        candidates = [p for p in all_problems if p.id not in solved_ids]

    # Sort by difficulty: Easy first, then Medium, then Hard
    difficulty_order = {"Easy": 0, "Medium": 1, "Hard": 2}
    candidates.sort(key=lambda p: difficulty_order.get(p.difficulty, 0))

    # Build the path: progressive difficulty with tag coverage
    path = []
    used_tags = set()
    remaining = list(candidates)

    # Phase 1: Easy problems in focus areas
    for diff in ("Easy", "Medium", "Hard"):
        for problem in remaining[:]:
            if len(path) >= path_length:
                break
            if problem.difficulty == diff:
                path.append({
                    "problem": problem,
                    "step": len(path) + 1,
                    "focus": list(set(problem.tags or []) & set(focus_tags)) if focus_tags else problem.tags or [],
                })
                remaining.remove(problem)
                used_tags.update(problem.tags or [])

    estimated_time = sum(
        10 if p["problem"].difficulty == "Easy"
        else 20 if p["problem"].difficulty == "Medium"
        else 35
        for p in path
    )

    return {
        "problems": path,
        "estimated_time_minutes": estimated_time,
        "focus_areas": focus_tags or list(used_tags)[:5],
        "total_steps": len(path),
    }


def _difficulty_zpd_score(problem_difficulty: str, recommended_difficulty: str) -> float:
    """
    Score how well a problem's difficulty matches the user's ZPD.
    1.0 = perfect match, diminishing for mismatch.
    """
    diff_map = {"Easy": 0, "Medium": 1, "Hard": 2}
    prob_val = diff_map.get(problem_difficulty, 0)
    rec_val = diff_map.get(recommended_difficulty, 0)
    distance = abs(prob_val - rec_val)

    if distance == 0:
        return 1.0
    elif distance == 1:
        return 0.5
    else:
        return 0.1
