"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowRight, Brain, TrendingUp, Target, Zap, BookOpen, Clock } from 'lucide-react';

interface Recommendation {
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
  companies: string[];
  score: number;
  reason: string;
}

interface LearningPath {
  step: number;
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
  companies: string[];
  focus: string[];
}

interface SmartRecommendationsProps {
  userId?: number;
}

export default function SmartRecommendations({ userId }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        // Fetch personalized recommendations
        const recResponse = await api.get('/recommendations/?top_n=5');
        setRecommendations(recResponse.data.problems || []);
        
        // Fetch learning path
        const pathResponse = await api.get('/recommendations/path?path_length=5');
        setLearningPath(pathResponse.data.problems || []);
        
      } catch (error: any) {
        console.error('Failed to fetch recommendations:', error);
        setError(error.response?.data?.detail || 'Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Hard':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Recommendations Skeleton */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-blue-500/20 rounded w-48 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-500/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-500/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path Skeleton */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-purple-500/20 rounded w-40 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-500/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-blue-500/20"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recommended For You
            </h2>
            <div className="ml-auto text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded">
              ML-Powered
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-blue-500/20 transition-all duration-300 hover:bg-white/10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {rec.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Target className="w-3 h-3" />
                        {Math.round(rec.score * 10)}% match
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {rec.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-blue-500/5 text-blue-300 border border-blue-500/10">
                          #{tag}
                        </span>
                      ))}
                      {rec.companies.slice(0, 2).map(company => (
                        <span key={company} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                          {company}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-400 italic">{rec.reason}</p>
                  </div>
                  
                  <Link
                    href={`/problem/${rec.id}`}
                    className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all duration-300"
                  >
                    Solve <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {learningPath.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-purple-500/20"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Learning Path
            </h2>
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="font-mono bg-white/5 px-2 py-1 rounded">
                {learningPath.length * 15} min
              </span>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            {learningPath.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all duration-300 hover:bg-white/10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                    {step.step}
                  </div>
                  {index < learningPath.length - 1 && (
                    <div className="absolute top-8 left-4 w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                      {step.title}
                    </h4>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold border ${getDifficultyColor(step.difficulty)}`}>
                      {step.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {step.focus.map(focus => (
                      <span key={focus} className="text-xs px-1.5 py-0.5 rounded bg-purple-500/5 text-purple-300 border border-purple-500/10">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link
                  href={`/problem/${step.id}`}
                  className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all duration-300"
                >
                  Start <Zap className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
            <Link
              href="/recommendations/path"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              View Full Learning Path
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
