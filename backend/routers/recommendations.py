"""
ML-Powered Recommendations Router
Replaces the old rule-based system with intelligent, adaptive recommendations.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import database
import dependencies
import models
import schemas
from services.ml_recommender import get_learning_path, get_next_after_failure, get_recommendations
from services.similarity_engine import similarity_engine

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
)


@router.get("/")
def get_recommendation_list(
    top_n: int = Query(default=5, ge=1, le=20),
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    """Get top-N personalized problem recommendations based on ML scoring."""
    results = get_recommendations(db, current_user.id, top_n=top_n)

    if not results:
        raise HTTPException(status_code=404, detail="No recommendations available")

    # Build response
    recommendations = []
    for item in results:
        problem = item["problem"]
        recommendations.append({
            "id": problem.id,
            "title": problem.title,
            "difficulty": problem.difficulty,
            "tags": problem.tags or [],
            "companies": problem.companies or [],
            "score": item["score"],
            "reason": item["reason"],
        })

    # Build an overall reason string
    reasons_set = set()
    for item in results:
        reasons_set.update(item.get("reasons", []))

    return {
        "problems": recommendations,
        "reason": "; ".join(list(reasons_set)[:3]),
        "confidence": round(results[0]["score"] / 10, 2) if results else 0.0,
    }


@router.get("/next")
def get_next_recommendation(
    failed_problem_id: int,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    """Get the best next problem after failing a specific problem."""
    result = get_next_after_failure(db, current_user.id, failed_problem_id)

    if not result:
        raise HTTPException(status_code=404, detail="No suitable recommendation found")

    problem = result["problem"]
    return {
        "id": problem.id,
        "title": problem.title,
        "difficulty": problem.difficulty,
        "tags": problem.tags or [],
        "companies": problem.companies or [],
        "score": result["score"],
        "reason": result["reason"],
    }


@router.get("/path")
def get_learning_path_endpoint(
    path_length: int = Query(default=10, ge=3, le=30),
    focus_tags: Optional[str] = Query(default=None, description="Comma-separated tags"),
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    """Get an ordered learning path with progressive difficulty."""
    tags = focus_tags.split(",") if focus_tags else None

    result = get_learning_path(db, current_user.id, focus_tags=tags, path_length=path_length)

    # Format problems for response
    path_problems = []
    for item in result.get("problems", []):
        problem = item["problem"]
        path_problems.append({
            "step": item["step"],
            "id": problem.id,
            "title": problem.title,
            "difficulty": problem.difficulty,
            "tags": problem.tags or [],
            "companies": problem.companies or [],
            "focus": item.get("focus", []),
        })

    return {
        "problems": path_problems,
        "estimated_time_minutes": result.get("estimated_time_minutes", 0),
        "focus_areas": result.get("focus_areas", []),
        "total_steps": result.get("total_steps", 0),
    }


@router.get("/similar/{problem_id}")
def get_similar_problems(
    problem_id: int,
    top_n: int = Query(default=5, ge=1, le=10),
    db: Session = Depends(database.get_db),
):
    """Get problems similar to a given problem based on tags and difficulty."""
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    similarity_engine.initialize(db)
    similar = similarity_engine.get_similar_problems(db, problem_id, top_n=top_n)

    results = []
    for pid, score in similar:
        p = db.query(models.Problem).filter(models.Problem.id == pid).first()
        if p:
            results.append({
                "id": p.id,
                "title": p.title,
                "difficulty": p.difficulty,
                "tags": p.tags or [],
                "companies": p.companies or [],
                "similarity_score": round(score, 3),
            })

    return {"similar_problems": results}


@router.get("/profile")
def get_user_profile(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
):
    """Get the user's ML skill profile (useful for debugging and display)."""
    from services.feature_engineering import build_user_profile

    profile = build_user_profile(db, current_user.id)
    return profile
