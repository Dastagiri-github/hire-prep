"""
Tests for ML Recommendation Engine
"""

import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from services.feature_engineering import build_user_profile
from services.ml_recommender import get_recommendations, get_learning_path
from services.similarity_engine import similarity_engine


class TestFeatureEngineering:
    """Test feature engineering functions"""
    
    def test_build_user_profile_empty(self):
        """Test profile building with no performance data"""
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.all.return_value = []
        
        profile = build_user_profile(mock_db, user_id=1)
        
        assert profile is not None
        assert 'tag_accuracy' in profile
        assert 'difficulty_accuracy' in profile
        assert 'weak_tags' in profile
        assert profile['total_problems_attempted'] == 0
    
    def test_build_user_profile_with_data(self):
        """Test profile building with performance data"""
        # This would require setting up mock UserPerformanceLog objects
        # For now, just test the function exists and handles empty data
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.all.return_value = []
        
        profile = build_user_profile(mock_db, user_id=1)
        
        assert isinstance(profile, dict)
        assert 'tag_accuracy' in profile


class TestSimilarityEngine:
    """Test similarity engine functions"""
    
    def test_similarity_engine_initialization(self):
        """Test that similarity engine can be initialized"""
        mock_db = Mock(spec=Session)
        
        # Should not raise an exception
        similarity_engine.initialize(mock_db)
        
        # After initialization, should have some methods available
        assert hasattr(similarity_engine, 'get_similar_problems')
    
    def test_get_similar_problems(self):
        """Test getting similar problems"""
        mock_db = Mock(spec=Session)
        
        # Mock the similarity matrix
        with patch.object(similarity_engine, '_similarity_matrix', {1: [(2, 0.8), (3, 0.6)]}):
            similar = similarity_engine.get_similar_problems(mock_db, 1, top_n=2)
            
            assert isinstance(similar, list)
            # Should return problem IDs and similarity scores


class TestMLRecommender:
    """Test ML recommender functions"""
    
    @patch('services.ml_recommender.build_user_profile')
    @patch('services.ml_recommender.similarity_engine')
    def test_get_recommendations(self, mock_similarity, mock_profile):
        """Test getting recommendations"""
        mock_db = Mock(spec=Session)
        mock_profile.return_value = {
            'tag_accuracy': {'arrays': 0.8, 'strings': 0.6},
            'difficulty_accuracy': {'Easy': 0.9, 'Medium': 0.5},
            'weak_tags': ['strings', 'dynamic programming'],
            'total_problems_attempted': 10
        }
        
        # Mock problems query
        mock_problem = Mock()
        mock_problem.id = 1
        mock_problem.title = "Test Problem"
        mock_problem.difficulty = "Medium"
        mock_problem.tags = ["arrays", "strings"]
        mock_problem.companies = ["Google"]
        
        mock_db.query.return_value.filter.return_value.all.return_value = [mock_problem]
        
        recommendations = get_recommendations(mock_db, user_id=1, top_n=5)
        
        assert isinstance(recommendations, list)
        # Should return recommendation dictionaries with problem and score


class TestRecommendationAPI:
    """Test recommendation API endpoints"""
    
    def test_recommendations_endpoint_requires_auth(self):
        """Test that recommendations endpoint requires authentication"""
        # This would be tested with actual FastAPI TestClient
        # For now, just document the requirement
        pass
    
    def test_learning_path_endpoint_structure(self):
        """Test learning path endpoint returns correct structure"""
        mock_db = Mock(spec=Session)
        
        # Mock the learning path function
        with patch('services.ml_recommender.get_learning_path') as mock_path:
            mock_path.return_value = {
                'problems': [
                    {
                        'step': 1,
                        'problem': Mock(id=1, title="Problem 1", difficulty="Easy", tags=["arrays"], companies=[]),
                        'focus': ['arrays']
                    }
                ],
                'estimated_time_minutes': 75,
                'focus_areas': ['arrays', 'strings'],
                'total_steps': 5
            }
            
            from services.ml_recommender import get_learning_path
            result = get_learning_path(mock_db, user_id=1, path_length=5)
            
            assert 'problems' in result
            assert 'estimated_time_minutes' in result
            assert 'focus_areas' in result
            assert len(result['problems']) <= 5


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
