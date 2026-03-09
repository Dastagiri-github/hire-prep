"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    companies: string[];
    tags: string[];
    acceptance_rate?: number;
}

export default function DSAPage() {
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [solvedProblems, setSolvedProblems] = useState<Problem[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('All');
    const [selectedTopic, setSelectedTopic] = useState<string>('All');
    const [isCompanyExpanded, setIsCompanyExpanded] = useState(false);
    const [isTopicExpanded, setIsTopicExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [probsRes, solvedRes] = await Promise.all([
                    api.get('/problems/').catch(e => ({ data: [] })),
                    api.get('/auth/solved-problems').catch(e => ({ data: [] }))
                ]);

                setAllProblems(probsRes.data);
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
        let filtered = allProblems;

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
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-400">Loading DSA problems...</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#0a0f1c] p-4 md:p-8 pt-24">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Data Structures & Algorithms</h1>
                            <p className="text-gray-400">Master fundamental computer science concepts with our comprehensive problem set.</p>
                        </div>
                    </div>

                    {/* FILTERS */}
                    <div className="flex gap-3 justify-end border-b border-gray-800 pb-4">
                        <div className="relative group">
                            <button onClick={() => setIsCompanyExpanded(!isCompanyExpanded)} className="flex items-center justify-between min-w-[140px] px-4 py-2 bg-[#111827] border border-gray-800 rounded-xl text-white text-sm hover:border-gray-600 transition-colors">
                                {selectedCompany === 'All' ? 'Companies' : selectedCompany}
                                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                            </button>
                            {isCompanyExpanded && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-gray-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-hidden">
                                    {getUniqueCompanies().map(company => (
                                        <button
                                            key={company}
                                            onClick={() => { setSelectedCompany(company); setIsCompanyExpanded(false); setCurrentPage(1); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#1e293b] transition-colors ${selectedCompany === company ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                                        >
                                            {company}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <button onClick={() => setIsTopicExpanded(!isTopicExpanded)} className="flex items-center justify-between min-w-[120px] px-4 py-2 bg-[#111827] border border-gray-800 rounded-xl text-white text-sm hover:border-gray-600 transition-colors">
                                {selectedTopic === 'All' ? 'Topics' : selectedTopic}
                                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                            </button>
                            {isTopicExpanded && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-gray-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto w-max max-w-[300px]">
                                    {getUniqueTopics().map(topic => (
                                        <button
                                            key={topic}
                                            onClick={() => { setSelectedTopic(topic); setIsTopicExpanded(false); setCurrentPage(1); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#1e293b] transition-colors ${selectedTopic === topic ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'} truncate`}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PROBLEMS LIST */}
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
                        {filteredProblems().length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                No problems found matching criteria
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4">
                            <span className="text-gray-500 text-sm">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProblems().length)} of {filteredProblems().length}</span>
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
        </AuthGuard>
    );
}
