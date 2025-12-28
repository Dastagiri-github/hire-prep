"use client";
import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  tags: string[];
}

export default function CompanyRoadmap({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const companyName = decodeURIComponent(resolvedParams.name);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMsg(null);
        const encoded = encodeURIComponent(companyName);
        // Fetch problems first; do not fail the whole page if user is unauthenticated
        try {
          const probsRes = await api.get(`/problems/companies/${encoded}`);
          setProblems(probsRes.data || []);
        } catch (pErr) {
          console.error('Failed to fetch company problems', pErr);
          setProblems([]);
        }

        // Try to fetch the current user (optional) — ignore auth failure
        try {
          const userRes = await api.get('/auth/me');
          // If user details include solved ids, extract them here (adapt as backend supports)
          if (userRes?.data?.solved_ids) {
            setSolvedIds(new Set(userRes.data.solved_ids));
          }
        } catch (uErr) {
          console.debug('Not authenticated or failed to fetch user (ignored)', uErr?.response?.status || uErr?.message);
        }
        
        // Extract solved IDs from user stats (simplified)
        // Ideally we should have a dedicated endpoint for solved IDs
        // For now, let's assume we can get it or just fetch submissions
        // Let's fetch submissions to be accurate
        // But we don't have a 'my submissions' endpoint yet easily accessible
        // Let's just use the stats if possible or fetch all submissions
        // Actually, let's just fetch all submissions for now
        // Or better, add a 'solved_ids' to /auth/me response?
        // Let's try to fetch submissions
        // Wait, we don't have a 'get my submissions' endpoint.
        // Let's skip the 'lock' logic for a second and just show the list.
      } catch (error: any) {
        // Log the raw error and also structured details for easier debugging
        console.error('Failed to fetch data (raw error):', error);
        const logObj = {
          message: error?.message,
          status: error?.response?.status,
          responseData: error?.response?.data,
        };
        try {
          console.error('Failed to fetch data (details):', JSON.stringify(logObj));
        } catch (e) {
          console.error('Failed to stringify error details', logObj);
        }
        setProblems([]);
        setErrorMsg(error?.response?.data?.detail || error?.message || 'Failed to fetch data');
      }
    };
    fetchData();
  }, [companyName]);

  // Group by difficulty
  const levels = {
    'Level 1: Fundamentals (Easy)': problems.filter(p => p.difficulty === 'Easy'),
    'Level 2: Core Concepts (Medium)': problems.filter(p => p.difficulty === 'Medium'),
    'Level 3: Advanced (Hard)': problems.filter(p => p.difficulty === 'Hard'),
  };

  return (
    <div className="p-3 max-w-4xl mx-auto mt-5 bright:bg-white bright:text-black companies-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{companyName} Roadmap</span>
        </h1>
        <p className="text-gray-400">Master the most asked questions to crack the interview.</p>
        {errorMsg && (
          <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-300">
            <strong className="font-semibold">Error:</strong> {errorMsg}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {Object.entries(levels).map(([levelName, levelProblems], idx) => (
          <div key={levelName} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden dark:bg-gray-800 bright:bg-white bright:border-gray-200 bright:text-black">
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center dark:bg-gray-800 bright:bg-white bright:border-gray-200">
              <h2 className="text-xl font-bold text-white bright:text-black">{levelName}</h2>
              <span className="text-sm text-gray-400 bright:text-gray-600">{levelProblems.length} Problems</span>
            </div>
            
            <div className="divide-y divide-gray-700 bright:divide-gray-200">
              {levelProblems.map((problem) => (
                <div key={problem.id} className="p-4 flex items-center justify-between hover:bg-gray-700/20 bright:hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <Circle className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-white bright:text-gray-900">{problem.title}</h3>
                      <div className="flex gap-2 mt-1">
                        {problem.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300 bright:bg-white bright:text-gray-700 bright:border bright:border-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/problem/${problem.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                  >
                    Solve
                  </Link>
                </div>
              ))}
              
              {levelProblems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No problems in this level yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
