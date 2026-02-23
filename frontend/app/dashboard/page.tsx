"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Filter, ArrowRight } from 'lucide-react';

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
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(false);
  const [isTopicExpanded, setIsTopicExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const probsRes = await api.get('/problems');
        setProblems(probsRes.data);
      } catch (error) {
        console.error('Failed to fetch problems');
      }

      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.id) {
          const statsRes = await api.get(`/stats/user/${userRes.data.id}`);
          setStats(statsRes.data);
        }
      } catch (error) {
        console.log('User not logged in or failed to fetch stats');
      }
    };
    fetchData();
  }, []);

  const companies = ['All', ...Array.from(new Set(problems.flatMap(p => p.companies || [])))];
  const topics = ['All', ...Array.from(new Set(problems.flatMap(p => p.tags || [])))];

  const filteredProblems = problems.filter(p => {
    const matchesCompany = selectedCompany === 'All' || (p.companies || []).includes(selectedCompany);
    const matchesTopic = selectedTopic === 'All' || (p.tags || []).includes(selectedTopic);
    return matchesCompany && matchesTopic;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompany, selectedTopic]);

  const indexOfLastProblem = currentPage * itemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - itemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);

  const totalProblems = problems.length;
  const solvedCount = stats?.total_solved || 0;
  const progress = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 pt-6 max-w-7xl mx-auto min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 space-y-6">
        {/* Progress Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-blue-500/20"></div>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            Your Progress
          </h2>

          <div className="relative pt-2 z-10">
            <div className="flex mb-3 items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Total Solved
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-800/50 border border-white/5">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-[0_0_15px_rgba(59,130,246,0.5)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-shimmer transition-all duration-1000 ease-out"
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-400 text-center font-mono relative z-10">
            <span className="text-white font-bold">{solvedCount}</span> <span className="text-gray-600">/</span> {totalProblems} Problems
          </p>
        </div>

        {/* Topic Strength Chart */}
        {stats && stats.topic_radar.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-bold mb-4 text-gray-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Topic Strength
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topic_radar}>
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: '#60a5fa' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="A" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          {/* Company Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-200 text-sm uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                Company
              </h3>
              <button
                onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                {isCompanyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(isCompanyExpanded ? companies : companies.slice(0, 10)).map(company => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border ${selectedCompany === company
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* Topic Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-200 text-sm uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                Topic
              </h3>
              <button
                onClick={() => setIsTopicExpanded(!isTopicExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                {isTopicExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(isTopicExpanded ? topics : topics.slice(0, 10)).map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border ${selectedTopic === topic
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link href="/companies" className="group block w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-center rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center justify-center gap-2 text-white">
            View Company Roadmaps <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            Problem Dashboard
          </h1>
          <div className="text-sm text-gray-400 font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/10">
            {filteredProblems.length} Problems Found
          </div>
        </div>

        <div className="grid gap-4">
          {currentProblems.map((problem, index) => (
            <div
              key={problem.id}
              className="glass-panel p-6 rounded-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-center">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{problem.title}</h2>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]' :
                        'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]'
                      }`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {problem.companies.map(c => (
                      <span key={c} className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 transition-colors">
                        {c}
                      </span>
                    ))}
                    {problem.tags && problem.tags.map(t => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-blue-500/5 text-blue-300 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center h-full">
                  <Link
                    href={`/problem/${problem.id}`}
                    className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all duration-300 shadow-lg shadow-blue-500/20"
                  >
                    <span className="text-white">Solve</span> <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 border border-white/5"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>

            <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/5 font-mono text-sm">
              <span className="text-gray-400">Page</span> <span className="text-white font-bold mx-1">{currentPage}</span> <span className="text-gray-600">/</span> <span className="text-gray-400">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 border border-white/5"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

