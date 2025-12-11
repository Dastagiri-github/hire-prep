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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [probsRes, userRes] = await Promise.all([
          api.get(`/problems/companies/${companyName}`),
          api.get('/auth/me')
        ]);
        setProblems(probsRes.data);
        
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
      } catch (error) {
        console.error('Failed to fetch data');
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{companyName} Roadmap</h1>
        <p className="text-gray-400">Master the most asked questions to crack the interview.</p>
      </div>

      <div className="space-y-8">
        {Object.entries(levels).map(([levelName, levelProblems], idx) => (
          <div key={levelName} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{levelName}</h2>
              <span className="text-sm text-gray-400">{levelProblems.length} Problems</span>
            </div>
            
            <div className="divide-y divide-gray-700">
              {levelProblems.map((problem) => (
                <div key={problem.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition">
                  <div className="flex items-center gap-4">
                    <Circle className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-white">{problem.title}</h3>
                      <div className="flex gap-2 mt-1">
                        {problem.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
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
