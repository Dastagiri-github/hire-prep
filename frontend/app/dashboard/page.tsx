"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Filter, ArrowRight, Target, Trophy, BookOpen } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  companies: string[];
  tags: string[];
}

interface UserStats {
  topic_radar: { subject: string; A: number; fullMark: number }[];
  activity_graph: { date: string; count: number }[];
  total_solved: number;
}

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [recommendedProblems, setRecommendedProblems] = useState<Problem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(false);
  const [isTopicExpanded, setIsTopicExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'recommended' | 'solved' | 'all'>('recommended');
  const itemsPerPage = 5;

  useEffect(() => {
    // Get user ID from localStorage or from token
    const getUserId = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Simple JWT decode to get user ID (in production, use proper JWT library)
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.sub || payload.user_id;
        } catch (e) {
          console.error('Failed to decode token');
        }
      }
      return null;
    };

    const currentUserId = getUserId();
    setUserId(currentUserId);

    const fetchData = async () => {
      if (!currentUserId) return;
      
      try {
        // Fetch all problems
        const probsRes = await api.get('/problems/');
        setAllProblems(probsRes.data);
        setProblems(probsRes.data);
        
        // Fetch recommended problems
        const recRes = await api.get('/recommendations/');
        setRecommendedProblems(recRes.data.problems || []);
        
        // Fetch user stats
        const statsRes = await api.get('/stats/user');
        setStats(statsRes.data);
        
        // Fetch solved problems
        const solvedRes = await api.get('/auth/solved-problems');
        setSolvedProblems(solvedRes.data);
        
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUniqueCompanies = () => {
    const companies = new Set<string>();
    allProblems.forEach(problem => {
      problem.companies?.forEach(company => companies.add(company));
    });
    return ['All', ...Array.from(companies).sort()];
  };

  const getUniqueTopics = () => {
    const topics = new Set<string>();
    allProblems.forEach(problem => {
      problem.tags?.forEach(tag => topics.add(tag));
    });
    return ['All', ...Array.from(topics).sort()];
  };

  const filteredProblems = () => {
    let filtered = viewMode === 'recommended' ? recommendedProblems : 
                   viewMode === 'solved' ? solvedProblems : 
                   allProblems;
    
    if (selectedCompany !== 'All') {
      filtered = filtered.filter(p => p.companies?.includes(selectedCompany));
    }
    
    if (selectedTopic !== 'All') {
      filtered = filtered.filter(p => p.tags?.includes(selectedTopic));
    }
    
    return filtered;
  };

  const totalPages = Math.ceil(filteredProblems().length / itemsPerPage);
  const paginatedProblems = filteredProblems().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Loading your personalized learning experience...</p>
          </div>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Your personalized interview preparation hub</p>
          </div>

          {/* View Mode Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1 flex">
              <button
                onClick={() => setViewMode('recommended')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'recommended' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Recommended
              </button>
              <button
                onClick={() => setViewMode('solved')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'solved' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Solved
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  viewMode === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                All Problems
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Company Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
                >
                  <Filter className="w-4 h-4" />
                  {selectedCompany === 'All' ? 'All Companies' : selectedCompany}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCompanyExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isCompanyExpanded && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-white/20 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {getUniqueCompanies().map(company => (
                      <button
                        key={company}
                        onClick={() => {
                          setSelectedCompany(company);
                          setIsCompanyExpanded(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                          selectedCompany === company ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Topic Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsTopicExpanded(!isTopicExpanded)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
                >
                  <Filter className="w-4 h-4" />
                  {selectedTopic === 'All' ? 'All Topics' : selectedTopic}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isTopicExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isTopicExpanded && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-white/20 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {getUniqueTopics().map(topic => (
                      <button
                        key={topic}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setIsTopicExpanded(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                          selectedTopic === topic ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
                <span className="text-white font-medium">
                  {filteredProblems().length} {viewMode === 'recommended' ? 'Recommended' : viewMode === 'solved' ? 'Solved' : 'Problems'}
                </span>
              </div>
            </div>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problem/${problem.id}`}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {problem.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {problem.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-lg border border-blue-500/20">
                      {tag}
                    </span>
                  ))}
                  {problem.tags && problem.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-lg">
                      +{problem.tags.length - 3}
                    </span>
                  )}
                </div>
                {problem.companies && problem.companies.length > 0 && (
                  <div className="text-xs text-gray-400">
                    Asked at: {problem.companies.slice(0, 2).join(', ')}
                    {problem.companies.length > 2 && '...'}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs text-gray-500">
                    {viewMode === 'solved' ? 'Solved' : viewMode === 'recommended' ? 'Recommended' : 'Practice'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Stats Section */}
          {stats && (
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Your Progress
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Problems Solved</span>
                    <span className="text-2xl font-bold text-green-400">{stats.total_solved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {stats.total_solved > 0 ? Math.round((stats.total_solved / (stats.total_solved + 10)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Topic Performance
                </h2>
                <div className="space-y-3">
                  {stats.topic_radar.map((topic, index) => (
                    <div key={topic.subject} className="flex justify-between items-center">
                      <span className="text-gray-300">{topic.subject}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-400"
                            style={{ width: `${(topic.A / topic.fullMark) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-blue-400 text-sm">{Math.round((topic.A / topic.fullMark) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
