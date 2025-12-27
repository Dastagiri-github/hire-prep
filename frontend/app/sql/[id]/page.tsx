"use client";
import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Editor from "@monaco-editor/react";
import Link from 'next/link';
import { Play, CheckCircle, XCircle, Database, Table as TableIcon, Menu, ChevronLeft, ChevronRight, Code2, Terminal } from 'lucide-react';
import ResizableSplit from '@/components/ResizableSplit';
import ThemeToggle from '@/components/ThemeToggle';

interface SQLChapter {
    id: number;
    title: string;
    problems: SQLProblem[];
}

interface SQLProblem {
    id: number;
    title: string;
    description: string;
    chapter_id: number;
    difficulty: string;
    tables?: Record<string, any[]>;
}

interface ExecutionResult {
    success: boolean;
    user_result: any[];
    expected_result: any[];
    columns: string[];
    error: string | null;
    tables?: Record<string, any[]>;
}

export default function SQLWorkspace({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [problem, setProblem] = useState<SQLProblem | null>(null);
    const [chapters, setChapters] = useState<SQLChapter[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [code, setCode] = useState<string>("-- Write your SQL query here\nSELECT * FROM users;");
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [loading, setLoading] = useState(false);

    const allProblems = chapters.flatMap(c => c.problems);
    const currentProblemIndex = allProblems.findIndex(p => p.id === problem?.id);
    const prevProblem = currentProblemIndex > 0 ? allProblems[currentProblemIndex - 1] : null;
    const nextProblem = currentProblemIndex < allProblems.length - 1 ? allProblems[currentProblemIndex + 1] : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [probRes, chapRes] = await Promise.all([
                    api.get(`/sql/problems/${resolvedParams.id}`),
                    api.get('/sql/chapters')
                ]);
                setProblem(probRes.data);
                setChapters(chapRes.data);
            } catch (error) {
                console.error('Failed to fetch data');
            }
        };
        fetchData();
    }, [resolvedParams.id]);

    const handleRun = async () => {
        setLoading(true);
        try {
            const res = await api.post('/sql/run', {
                problem_id: parseInt(resolvedParams.id),
                user_query: code
            });
            setResult(res.data);
        } catch (error: any) {
            console.error('Failed to run query', error);
            setResult({
                success: false,
                user_result: [],
                expected_result: [],
                columns: [],
                error: error.response?.data?.detail || error.message || "Network Error"
            });
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]';
            case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    if (!problem) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;

    const tablesToDisplay = result?.tables || problem.tables;

    return (
        <div className="flex flex-col h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f1e] to-black">
            {/* Header */}
            <div className="h-16 border-b border-white/5 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link
                        href="/sql"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <div className="bg-white/5 border border-white/10 rounded-lg">
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 text-gray-400 hover:text-white cursor-pointer hover:scale-105"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-6">
                        <Link
                            href={prevProblem ? `/sql/${prevProblem.id}` : '#'}
                            className={`p-2 rounded-lg transition-all duration-200 ${prevProblem ? 'hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer hover:scale-105' : 'text-gray-800 cursor-not-allowed pointer-events-none'}`}
                            title={prevProblem ? `Previous: ${prevProblem.title}` : 'No previous problem'}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <Link
                            href={nextProblem ? `/sql/${nextProblem.id}` : '#'}
                            className={`p-2 rounded-lg transition-all duration-200 ${nextProblem ? 'hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer hover:scale-105' : 'text-gray-800 cursor-not-allowed pointer-events-none'}`}
                            title={nextProblem ? `Next: ${nextProblem.title}` : 'No next problem'}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-lg leading-tight">{problem.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all duration-200 hover:scale-105 cursor-default ${getDifficultyColor(problem.difficulty)}`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md shadow-green-500/20 hover:shadow-green-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {loading ? 'Running...' : 'Run Query'}
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar */}
                <div className={`border-r border-white/5 bg-gray-900/30 flex flex-col overflow-y-auto shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden pointer-events-none'}`}>
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Code2 className="w-4 h-4" />
                            Curriculum
                        </h3>
                        <div className="space-y-8">
                            {chapters.map(chapter => (
                                <div key={chapter.id}>
                                    <h4 className="text-sm font-bold text-gray-200 mb-3 px-2 border-l-2 border-blue-500/50 pl-3">{chapter.title}</h4>
                                    <div className="space-y-1">
                                        {chapter.problems.map(p => (
                                            <Link
                                                key={p.id}
                                                href={`/sql/${p.id}`}
                                                className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer ${p.id === problem.id
                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:translate-x-1'
                                                    }`}
                                            >
                                                {p.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resizable Layout: Question Panel | Editor & Results */}
                <ResizableSplit
                    initialLeft={30}
                    left={
                        <div className="h-full border-r border-white/5 bg-gray-900/20 flex flex-col min-w-[300px] backdrop-blur-sm">
                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="prose prose-invert max-w-none">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        Problem Description
                                    </h2>
                                    <div className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <p className="whitespace-pre-wrap">{problem.description}</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <TableIcon className="w-4 h-4" />
                                        Schema Information
                                    </h3>
                                    <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
                                        {tablesToDisplay ? (
                                            <div className="p-4 space-y-6">
                                                {Object.entries(tablesToDisplay).map(([tableName, rows]) => (
                                                    <div key={tableName}>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Database className="w-3 h-3 text-gray-500" />
                                                            <h4 className="text-xs font-bold text-gray-300 font-mono">{tableName}</h4>
                                                        </div>
                                                        <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/20">
                                                            <table className="w-full text-left border-collapse text-xs">
                                                                <thead>
                                                                    <tr>
                                                                        {rows.length > 0 && Object.keys(rows[0]).map((col) => (
                                                                            <th key={col} className="p-3 border-b border-white/10 font-bold text-gray-400 bg-white/5 whitespace-nowrap">
                                                                                {col}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {rows.map((row, i) => (
                                                                        <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer">
                                                                            {Object.values(row).map((val: any, j) => (
                                                                                <td key={j} className="p-3 border-b border-white/5 text-gray-300 font-mono whitespace-nowrap">
                                                                                    {String(val)}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                                <p className="text-xs text-gray-400">Loading schema...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    right={
                        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                            {/* Resizable: Editor | Results */}
                            <ResizableSplit
                                initialLeft={55}
                                left={
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-0">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="sql"
                                                theme="vs-dark"
                                                value={code}
                                                onChange={(value) => setCode(value || "")}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                    padding: { top: 24, bottom: 24 },
                                                    scrollBeyondLastLine: false,
                                                    lineNumbers: "on",
                                                    renderLineHighlight: "all",
                                                    smoothScrolling: true,
                                                    cursorBlinking: "smooth",
                                                    cursorSmoothCaretAnimation: "on",
                                                }}
                                            />
                                        </div>
                                    </div>
                                }
                                right={
                                    <div className="bg-gray-900 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10 min-w-[250px]">
                        <div className="h-12 border-b border-white/10 flex items-center px-6 bg-gray-800/50 backdrop-blur-sm justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-300">Query Results</span>
                            </div>
                            {result && (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${result.success
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {result.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {result.success ? 'Success' : 'Error'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto p-0 bg-[#0d1117]">
                            {result ? (
                                <div className="min-h-full">
                                    {result.error ? (
                                        <div className="p-6">
                                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-sm flex items-start gap-3">
                                                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="font-bold mb-1">Execution Error</div>
                                                    {result.error}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {result.user_result.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr>
                                                                {result.columns.map((col) => (
                                                                    <th key={col} className="p-3 border-b border-white/10 text-xs font-bold text-gray-400 uppercase bg-white/5 whitespace-nowrap sticky top-0 backdrop-blur-sm">
                                                                        {col}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {result.user_result.map((row, i) => (
                                                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                                    {result.columns.map((col) => (
                                                                        <td key={col} className="p-3 border-b border-white/5 text-sm text-gray-300 font-mono whitespace-nowrap group-hover:text-white">
                                                                            {row[col]}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                                                    <Database className="w-12 h-12 mb-4 opacity-20" />
                                                    <p className="text-sm">Query executed successfully but returned no rows.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                                        <Play className="w-8 h-8 opacity-20 ml-1" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Run your query to see results</p>
                                </div>
                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
}
