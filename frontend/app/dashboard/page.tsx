"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, Filter, ArrowRight, Target, Trophy, BookOpen, Clock, Flame, Shield, Calendar as CalendarIcon, Star } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { ActivityCalendar } from 'react-activity-calendar';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { DashboardSkeleton } from '@/components/Skeleton';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  companies: string[];
  tags: string[];
  acceptance_rate?: number;
}

interface HeatmapData {
  date: string;
  count: number;
  level?: number;
}

interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

interface RecentSubmission {
  id: number;
  problem_id: number;
  title: string;
  difficulty: string;
  problem_type: string;
  status: string;
  time_spent_seconds: number;
  submitted_at: string;
}

interface Badge {
  id: number;
  badge_name: string;
  earned_at: string;
}

interface UserStats {
  total_solved: number;
  total_time_spent_seconds: number;
  current_streak: number;
  longest_streak: number;
  reputation: number;
  global_percentile: number;
  difficulty_breakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  topic_radar: RadarData[];
  activity_graph: HeatmapData[];
  recent_submissions: RecentSubmission[];
  badges: Badge[];
}

interface DailyChallenge {
  date: string;
  problem_id: number;
  problem_type: string;
  title: string;
  difficulty: string;
  description: string;
}

export default function Dashboard() {
  const [recommendedProblems, setRecommendedProblems] = useState<Problem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailySolved, setDailySolved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    // Get user ID from localStorage or from token
    const getUserId = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
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
        // Parallel fetching for performance with individual error handling to prevent complete failure
        const [recRes, statsRes, solvedRes] = await Promise.all([
          api.get('/recommendations/').catch(e => ({ data: { problems: [] } })),
          api.get('/stats/user').catch(e => ({ data: null })),
          api.get('/auth/solved-problems').catch(e => ({ data: [] }))
        ]);

        setRecommendedProblems(recRes.data.problems || []);

        // Format activity graph data for react-activity-calendar
        if (statsRes.data && statsRes.data.activity_graph) {
          const formattedGraph = statsRes.data.activity_graph.map((d: any) => {
            let level = 0;
            if (d.count > 0 && d.count <= 2) level = 1;
            else if (d.count > 2 && d.count <= 5) level = 2;
            else if (d.count > 5 && d.count <= 8) level = 3;
            else if (d.count > 8) level = 4;
            return { ...d, level };
          }).filter((d: any) => d.date); // Must have valid date

          statsRes.data.activity_graph = formattedGraph.length > 0 ? formattedGraph : [{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }];
        }

        setStats(statsRes.data);
        setSolvedProblems(solvedRes.data);

        // Fetch Daily Challenge
        try {
          const [dailyRes, statusRes] = await Promise.all([
            api.get('/problems/daily'),
            api.get('/problems/daily/status')
          ]);
          setDailyChallenge(dailyRes.data);
          setDailySolved(statusRes.data.solved);
        } catch (e) {
          console.log("No daily challenge assigned today");
        }

      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);



  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const totalPages = Math.ceil(recommendedProblems.length / itemsPerPage);
  const paginatedProblems = recommendedProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardSkeleton />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0f1c] p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* LEFT SIDEBAR: PROFILE & METRICS (1/4 width on desktop) */}
          <div className="xl:col-span-1 space-y-6">

            {/* Profile Card */}
            <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    {stats?.total_solved || 0}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#111827] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" title="Online"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your Rank</h2>
                  <p className="text-blue-400 font-medium">Top {stats?.global_percentile || 100}%</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <span className="text-gray-400 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Reputation</span>
                  <span className="text-white font-bold">{stats?.reputation || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <span className="text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Time Spent</span>
                  <span className="text-white font-bold">{formatTime(stats?.total_time_spent_seconds || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <span className="text-gray-400 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Current Streak</span>
                  <span className="text-white font-bold">{stats?.current_streak || 0} Days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> Max Streak</span>
                  <span className="text-white font-bold">{stats?.longest_streak || 0} Days</span>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-lg">
              <h3 className="text-gray-400 font-medium text-sm mb-4">Difficulty Breakdown</h3>
              <div className="space-y-4">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Easy</span>
                    <span className="text-white font-mono">{stats?.difficulty_breakdown?.Easy || 0}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981]" style={{ width: `${Math.min(100, ((stats?.difficulty_breakdown?.Easy || 0) / Math.max(1, stats?.total_solved || 1)) * 100)}%` }}></div>
                  </div>
                </div>
                {/* Medium */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Medium</span>
                    <span className="text-white font-mono">{stats?.difficulty_breakdown?.Medium || 0}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#eab308]" style={{ width: `${Math.min(100, ((stats?.difficulty_breakdown?.Medium || 0) / Math.max(1, stats?.total_solved || 1)) * 100)}%` }}></div>
                  </div>
                </div>
                {/* Hard */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Hard</span>
                    <span className="text-white font-mono">{stats?.difficulty_breakdown?.Hard || 0}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ef4444]" style={{ width: `${Math.min(100, ((stats?.difficulty_breakdown?.Hard || 0) / Math.max(1, stats?.total_solved || 1)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Radar Chart */}
            {stats?.topic_radar && stats.topic_radar.length > 0 && (
              <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-lg">
                <h3 className="text-gray-400 font-medium text-sm mb-4">Topic Skills</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.topic_radar}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Badges (If any) */}
            {stats?.badges && stats.badges.length > 0 && (
              <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-lg">
                <h3 className="text-gray-400 font-medium text-sm mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map(b => (
                    <div key={b.id} className="p-2 bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl text-center">
                      <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                      <span className="text-xs text-yellow-500 font-medium">{b.badge_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="xl:col-span-3 space-y-6">

            {/* PROBLEM OF THE DAY BANNER */}
            {dailyChallenge && (
              <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-[#111827] p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 blur-[80px] opacity-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        Problem Of The Day
                      </span>
                      {dailySolved && (
                        <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Solved
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{dailyChallenge.title}</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`font-medium ${dailyChallenge.difficulty === 'Easy' ? 'text-green-400' :
                        dailyChallenge.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{dailyChallenge.difficulty}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 capitalize">{dailyChallenge.problem_type}</span>
                    </div>
                  </div>

                  <Link
                    href={`/${dailyChallenge.problem_type === 'coding' ? 'problem' : dailyChallenge.problem_type === 'sql' ? 'sql' : 'aptitude'}/${dailyChallenge.problem_id}`}
                    className={`px-8 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${dailySolved
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                      : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105'
                      }`}
                  >
                    {dailySolved ? 'Review Solution' : 'Solve Challenge'}
                  </Link>
                </div>
              </div>
            )}

            {/* HEATMAP / CONTINUOUS GRAPH */}
            <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-lg overflow-x-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  Submission Activity
                </h3>
                <span className="text-sm text-gray-400">{stats?.total_solved} submissions in the past year</span>
              </div>
              <div className="min-w-[700px] flex justify-center">
                {stats && stats.activity_graph && stats.activity_graph.length > 0 && (
                  <ActivityCalendar
                    data={stats.activity_graph as any}
                    theme={{
                      light: ['#1f2937', '#0e4429', '#006d32', '#26a641', '#39d353'],
                      dark: ['#1f2937', '#0e4429', '#006d32', '#26a641', '#39d353'],
                    }}
                    showMonthLabels={false}
                    labels={{
                      legend: {
                        less: 'Less',
                        more: 'More'
                      },
                      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                      totalCount: '{{count}} submissions in {{year}}',
                    }}
                  />
                )}
              </div>
            </div>

            {/* RECENT SUBMISSIONS FEED */}
            {stats?.recent_submissions && stats.recent_submissions.length > 0 && (
              <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 shadow-lg">
                <h3 className="text-white font-medium flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Recent Submissions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-sm">
                        <th className="font-medium p-3 pl-4">Time</th>
                        <th className="font-medium p-3">Problem</th>
                        <th className="font-medium p-3">Status</th>
                        <th className="font-medium p-3 text-right pr-4">Time Taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_submissions.slice(0, 5).map((sub, idx) => (
                        <tr key={sub.id} className={`border-b border-gray-800/50 hover:bg-[#1e293b]/50 transition-colors ${idx % 2 === 0 ? 'bg-[#0a0f1c]/30' : ''}`}>
                          <td className="p-3 pl-4 text-sm text-gray-400 whitespace-nowrap">
                            {new Date(sub.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Link href={`/${sub.problem_type === 'coding' ? 'problem' : sub.problem_type === 'sql' ? 'sql' : 'aptitude'}/${sub.problem_id}`} className="text-white font-medium hover:text-blue-400 transition-colors inline-block">
                              {sub.title}
                            </Link>
                            <span className="ml-2 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full capitalize">{sub.problem_type}</span>
                          </td>
                          <td className="p-3">
                            <span className={`text-sm font-medium ${sub.status === 'Accepted' || sub.status === 'Correct' ? 'text-green-500' : 'text-red-500'}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4 text-sm text-gray-400 font-mono">
                            {sub.time_spent_seconds ? formatTime(sub.time_spent_seconds) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABS & FILTERS - REMOVED */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Recommended For You
              </h3>
            </div>

            {/* PROBLEMS LIST (Table Format) */}
            <div className="bg-[#111827] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="font-medium p-4 pl-6">Title</th>
                    <th className="font-medium p-4 hidden md:table-cell">Acceptance</th>
                    <th className="font-medium p-4">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProblems.map((problem, idx) => {
                    const isSolved = solvedProblems.some(sp => sp.id === problem.id);
                    return (
                      <tr key={problem.id} className={`border-b border-gray-800/50 hover:bg-[#1e293b]/50 transition-colors ${idx % 2 === 0 ? 'bg-[#0a0f1c]/30' : ''}`}>
                        <td className="p-4 pl-6 border-r border-transparent">
                          <div className="flex items-center gap-3">
                            {isSolved && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                            <div className="flex-1">
                              <Link href={`/problem/${problem.id}`} className="text-white font-medium hover:text-blue-400 transition-colors inline-block">
                                {problem.id}. {problem.title}
                              </Link>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {problem.tags && problem.tags.slice(0, 2).map(t => (
                                  <span key={t} className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400 text-sm hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="w-8 text-right block text-xs">{problem.acceptance_rate?.toFixed(1) || '0.0'}%</span>
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${problem.acceptance_rate || 0}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`${problem.difficulty === 'Easy' ? 'text-[#10b981]' :
                            problem.difficulty === 'Medium' ? 'text-[#eab308]' :
                              'text-[#ef4444]'
                            } text-sm font-medium`}>
                            {problem.difficulty}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {recommendedProblems.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No recommendations available at this time
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <span className="text-gray-500 text-sm">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, recommendedProblems.length)} of {recommendedProblems.length}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-[#111827] hover:bg-gray-800 border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 bg-[#111827] hover:bg-gray-800 border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
