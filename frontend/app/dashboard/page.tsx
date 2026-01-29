"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  companies: string[];
  tags: string[];
}

interface UserStats {
  topic_radar: { subject: string; A: number; fullMark: number }[];
  total_solved: number;
}

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(false);
  const [isTopicExpanded, setIsTopicExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const probsRes = await api.get("/problems");
        setProblems(probsRes.data);
      } catch {}

      try {
        const userRes = await api.get("/auth/me");
        if (userRes.data.id) {
          const statsRes = await api.get(`/stats/user/${userRes.data.id}`);
          setStats(statsRes.data);
        }
      } catch {}
    };
    fetchData();
  }, []);

  const companies = ["All", ...new Set(problems.flatMap((p) => p.companies))];
  const topics = ["All", ...new Set(problems.flatMap((p) => p.tags || []))];

  const filteredProblems = problems.filter((p) => {
    const matchesCompany =
      selectedCompany === "All" || p.companies.includes(selectedCompany);
    const matchesTopic =
      selectedTopic === "All" || p.tags?.includes(selectedTopic);
    return matchesCompany && matchesTopic;
  });

  useEffect(() => setCurrentPage(1), [selectedCompany, selectedTopic]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const currentProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const progress =
    problems.length > 0
      ? ((stats?.total_solved || 0) / problems.length) * 100
      : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 pt-24 mt-2 max-w-7xl mx-auto min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 space-y-6 mt-15">
        {/* Progress */}
        <div className="glass-panel p-5 rounded-2xl">
          <h2 className="text-lg font-semibold mb-5">Your Progress</h2>

          <div className="flex justify-between text-xs mb-2">
            <span>Total Solved</span>
            <span className="font-semibold text-base">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>

          <p className="text-xs text-center mt-3">
            <b>{stats?.total_solved || 0}</b> / {problems.length} Problems
          </p>
        </div>

        {/* Topic Strength */}
        {stats && stats.topic_radar.length > 0 && (
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-semibold mb-4">Topic Strength</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topic_radar}>
                  <XAxis
                    dataKey="subject"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="A" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-panel p-5 rounded-2xl space-y-5">
          {/* Company */}
          <div>
            <div className="flex justify-between mb-3">
              <h3 className="text-xs font-semibold flex gap-1">
                <Filter className="w-4 h-4" /> Company
              </h3>
              <button onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}>
                {isCompanyExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(isCompanyExpanded ? companies : companies.slice(0, 8)).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCompany(c)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      selectedCompany === c
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-white/5"
                    }`}
                  >
                    {c}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Topic */}
          <div>
            <div className="flex justify-between mb-3">
              <h3 className="text-xs font-semibold flex gap-1">
                <Search className="w-4 h-4" /> Topic
              </h3>
              <button onClick={() => setIsTopicExpanded(!isTopicExpanded)}>
                {isTopicExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(isTopicExpanded ? topics : topics.slice(0, 8)).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    selectedTopic === t
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-white/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Problem Dashboard</h1>
          <span className="text-xs">
            {filteredProblems.length} Problems
          </span>
        </div>

        <div className="space-y-4">
          {currentProblems.map((p) => (
            <div
              key={p.id}
              className="glass-panel p-5 rounded-xl hover:border-blue-500/30"
            >
              <div className="flex justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">{p.title}</h2>

                  <div className="flex gap-2 flex-wrap text-xs">
                    {p.companies.map((c) => (
                      <span key={c} className="px-2 py-1 bg-white/5 rounded">
                        {c}
                      </span>
                    ))}
                    {p.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 bg-blue-500/10 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/problem/${p.id}`}
                  className="text-sm font-semibold text-blue-400 flex items-center gap-1"
                >
                  Solve <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </button>

            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
