"""
Similarity Engine
Computes problem-problem similarity using tag overlap and difficulty distance.
Uses TF-IDF weighting on tags for better similarity scoring.
"""

import math
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

import models


class SimilarityEngine:
    """Computes and caches problem similarity matrices."""

    def __init__(self):
        self._problem_vectors: Dict[int, Dict[str, float]] = {}
        self._idf_weights: Dict[str, float] = {}
        self._is_initialized = False

    def initialize(self, db: Session):
        """Build TF-IDF vectors and similarity data from all problems."""
        problems = db.query(models.Problem).all()
        if not problems:
            self._is_initialized = True
            return

        # Step 1: Compute IDF (Inverse Document Frequency) for each tag
        tag_doc_count = defaultdict(int)
        total_docs = len(problems)

        for problem in problems:
            unique_tags = set(problem.tags or [])
            for tag in unique_tags:
                tag_doc_count[tag] += 1

        self._idf_weights = {}
        for tag, count in tag_doc_count.items():
            self._idf_weights[tag] = math.log(total_docs / (1 + count)) + 1  # smoothed IDF

        # Step 2: Build TF-IDF vector for each problem
        difficulty_values = {"Easy": 0.0, "Medium": 0.5, "Hard": 1.0}
        self._problem_vectors = {}

        for problem in problems:
            vector = {}
            tags = problem.tags or []

            # TF-IDF components for tags
            tag_counts = defaultdict(int)
            for tag in tags:
                tag_counts[tag] += 1

            for tag, tf in tag_counts.items():
                idf = self._idf_weights.get(tag, 1.0)
                vector[f"tag_{tag}"] = tf * idf

            # Difficulty as a feature dimension
            vector["difficulty"] = difficulty_values.get(problem.difficulty, 0.0)

            self._problem_vectors[problem.id] = vector

        self._is_initialized = True

    def cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """Compute cosine similarity between two sparse vectors."""
        # Get all dimensions
        all_keys = set(vec_a.keys()) | set(vec_b.keys())

        dot_product = 0.0
        mag_a = 0.0
        mag_b = 0.0

        for key in all_keys:
            a_val = vec_a.get(key, 0.0)
            b_val = vec_b.get(key, 0.0)
            dot_product += a_val * b_val
            mag_a += a_val * a_val
            mag_b += b_val * b_val

        if mag_a == 0 or mag_b == 0:
            return 0.0

        return dot_product / (math.sqrt(mag_a) * math.sqrt(mag_b))

    def get_similar_problems(
        self,
        db: Session,
        problem_id: int,
        top_n: int = 5,
        exclude_ids: Optional[set] = None,
    ) -> List[Tuple[int, float]]:
        """
        Find the top-N most similar problems to the given problem.
        Returns list of (problem_id, similarity_score) tuples.
        """
        if not self._is_initialized:
            self.initialize(db)

        if problem_id not in self._problem_vectors:
            return []

        target_vector = self._problem_vectors[problem_id]
        exclude = exclude_ids or set()
        exclude.add(problem_id)

        similarities = []
        for pid, vec in self._problem_vectors.items():
            if pid in exclude:
                continue
            sim = self.cosine_similarity(target_vector, vec)
            similarities.append((pid, sim))

        # Sort by similarity descending
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_n]

    def get_tag_similarity(self, tags_a: List[str], tags_b: List[str]) -> float:
        """Compute similarity between two tag sets using Jaccard + IDF weighting."""
        if not tags_a or not tags_b:
            return 0.0

        set_a = set(tags_a)
        set_b = set(tags_b)

        intersection = set_a & set_b
        union = set_a | set_b

        if not union:
            return 0.0

        # Weighted Jaccard: weight each tag by IDF
        weighted_intersection = sum(self._idf_weights.get(t, 1.0) for t in intersection)
        weighted_union = sum(self._idf_weights.get(t, 1.0) for t in union)

        return weighted_intersection / weighted_union if weighted_union > 0 else 0.0

    def get_difficulty_distance(self, diff_a: str, diff_b: str) -> float:
        """Returns normalized distance between two difficulty levels (0 = same, 1 = max distance)."""
        values = {"Easy": 0, "Medium": 1, "Hard": 2}
        a = values.get(diff_a, 0)
        b = values.get(diff_b, 0)
        return abs(a - b) / 2.0


# Global singleton instance
similarity_engine = SimilarityEngine()
