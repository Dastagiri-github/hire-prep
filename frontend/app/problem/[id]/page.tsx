"use client";
import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Terminal, ChevronDown, ChevronUp, Code2, Cpu, Timer, ChevronLeft, ChevronRight, Send, Clock, Trophy, Users, Star, BookOpen, Target } from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-[#1e1e1e]" />
});
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { ProblemViewSkeleton } from '@/components/Skeleton';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    sample_test_cases: { input: string; output: string; explanation: string }[];
    companies?: string[];
    time_limit?: number;
    memory_limit?: number;
}

interface SubmissionResult {
    status: string;
    execution_time: number;
    memory_usage?: number;
    message?: string;
    expected_output?: string;
    actual_output?: string;
    test_cases_passed?: number;
    total_test_cases?: number;
    test_case_results?: {
        input: string;
        expected_output: string;
        actual_output: string;
        passed: boolean;
        execution_time: number;
    }[];
}

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [code, setCode] = useState('// Write your code here');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const [nextProblemId, setNextProblemId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [availableLanguages, setAvailableLanguages] = useState<string[]>(['python', 'javascript', 'cpp', 'java']);
    const [isOutputOpen, setIsOutputOpen] = useState(true);
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    const [activeTab, setActiveTab] = useState<'problem' | 'submissions' | 'editorial' | 'discussion'>('problem');
    const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
    const [currentSubmission, setCurrentSubmission] = useState<SubmissionResult | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const router = useRouter();

    const STARTER_CODE: Record<string, string> = {
        python: `def solution():
    # Write your code here
    # Read input from stdin
    import sys
    data = sys.stdin.read().strip().split()
    # Process input and output result
    print("Hello World")`,
        cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) {
            cin >> nums[i];
        }
        // Your solution here
        cout << "Hello World" << endl;
    }
    return 0;
}`,
        java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(System.in);
        // Your solution here
        System.out.println("Hello World");
    }
    
    static class FastScanner {
        BufferedReader br;
        StringTokenizer st;
        public FastScanner(InputStream in) {
            br = new BufferedReader(new InputStreamReader(in));
        }
        String next() throws IOException {
            while (st == null || !st.hasMoreElements()) {
                st = new StringTokenizer(br.readLine());
            }
            return st.nextToken();
        }
        int nextInt() throws IOException {
            return Integer.parseInt(next());
        }
    }
}`,
        javascript: `// Node.js solution
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = [];

rl.on('line', (line) => {
    input.push(line);
});

rl.on('close', () => {
    // Your solution here
    console.log("Hello World");
});`
    };

    useEffect(() => {
        const applyEditorThemeFromDoc = () => {
            if (typeof document === 'undefined') return;
            const isLight = document.documentElement.classList.contains('light');
            setEditorTheme(isLight ? 'vs' : 'vs-dark');
        };
        applyEditorThemeFromDoc();
        const handler = (e: any) => {
            setEditorTheme(e?.detail === 'light' ? 'vs' : 'vs-dark');
        };
        // Event listeners for theme changes
        window.addEventListener('themechange', handler);

        const checkHealth = async () => {
            try {
                const res = await api.get('/health');
                const compilers = res.data.compilers;
                const available = [];
                if (compilers.python) available.push('python');
                if (compilers.cpp) available.push('cpp');
                if (compilers.java) available.push('java');
                if (compilers.javascript) available.push('javascript');
                setAvailableLanguages(available);
            } catch (e) {
                console.error("Failed to check compiler health");
            }
        };
        checkHealth();

        const fetchProblem = async () => {
            try {
                const response = await api.get(`/problems/${resolvedParams.id}`);
                setProblem(response.data);
            } catch (error) {
                console.error('Failed to fetch problem');
                setError('Failed to load problem. Please ensure the backend is running and try again.');
            }
        };
        fetchProblem();

        return () => {
            window.removeEventListener('themechange', handler);
        };
    }, [resolvedParams.id]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isTimerRunning && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, startTime]);

    // Start timer when problem is loaded
    useEffect(() => {
        if (problem && !startTime) {
            setStartTime(Date.now());
            setIsTimerRunning(true);
        }
    }, [problem, startTime]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const pauseTimer = () => {
        setIsTimerRunning(false);
    };

    const resumeTimer = () => {
        if (startTime) {
            setStartTime(Date.now() - elapsedTime * 1000);
            setIsTimerRunning(true);
        }
    };

    const resetTimer = () => {
        setStartTime(Date.now());
        setElapsedTime(0);
        setIsTimerRunning(true);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(STARTER_CODE[newLang] || '');
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Running tests...');
        setCurrentSubmission(null);
        try {
            const response = await api.post('/submissions/', {
                problem_id: resolvedParams.id,
                code: code,
                language: language
            });
            setCurrentSubmission(response.data);
            setOutput('');
        } catch (error) {
            setOutput('Error executing code. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setOutput('Submitting solution...');
        setCurrentSubmission(null);
        setShowNextButton(false);
        try {
            const response = await api.post('/submissions/', {
                problem_id: resolvedParams.id,
                code: code,
                language: language,
                is_submission: true
            });

            const submissionData: SubmissionResult = response.data;
            setCurrentSubmission(submissionData);
            setOutput('');

            if (submissionData.status === 'Accepted') {
                setShowNextButton(true);
                fetchNextRecommendedProblem(true);
            }
        } catch (error) {
            setOutput('Error submitting solution. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchNextRecommendedProblem = async (isSuccess: boolean = false) => {
        try {
            let response;
            if (isSuccess) {
                // Get regular recommendations after success
                response = await api.get('/recommendations/');
                if (response.data && response.data.problems && response.data.problems.length > 0) {
                    setNextProblemId(response.data.problems[0].id);
                }
            } else {
                // Get next problem after failure
                response = await api.get('/recommendations/next', {
                    params: { failed_problem_id: resolvedParams.id }
                });
                if (response.data && response.data.id) {
                    setNextProblemId(response.data.id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch next recommended problem');
        }
    };

    const handleNextProblem = () => {
        if (nextProblemId) {
            router.push(`/problem/${nextProblemId}`);
        }
    };

    const fetchSubmissionHistory = async () => {
        try {
            const response = await api.get(`/submissions/problem/${resolvedParams.id}`);
            setSubmissionHistory(response.data.slice(0, 10)); // Show last 10 submissions
        } catch (error) {
            console.error('Failed to fetch submission history');
        }
    };

    useEffect(() => {
        if (activeTab === 'submissions') {
            fetchSubmissionHistory();
        }
    }, [activeTab, resolvedParams.id]);

    if (error) return (
        <div className="flex items-center justify-center min-h-screen pt-20">
            <div className="text-center p-8 glass-panel rounded-2xl border border-red-500/20">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <h2 className="text-xl font-bold mb-2 text-white">Error Loading Problem</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors font-medium"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    if (!problem) return (
        <AuthGuard>
            <ProblemViewSkeleton />
        </AuthGuard>
    );

    return (
        <AuthGuard>
            <div className="flex flex-col h-screen bg-[#0a0f1c] font-sans overflow-hidden">
                {/* Minimal Header */}
                <div className="flex items-center justify-between h-14 px-4 bg-[#111827] border-b border-gray-800 shrink-0 select-none">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Problems</span>
                        </button>
                        <div className="h-4 w-[1px] bg-gray-700"></div>
                        <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-sm tracking-wide">
                                {problem.id}. {problem.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-red-500/10 text-red-400'
                                }`}>
                                {problem.difficulty}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0f1c] border border-gray-800 rounded-lg">
                            <Timer className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 text-sm font-mono font-medium w-16 text-center">
                                {formatTime(elapsedTime)}
                            </span>
                            <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
                                <button
                                    onClick={isTimerRunning ? pauseTimer : resumeTimer}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                    title={isTimerRunning ? "Pause" : "Resume"}
                                >
                                    {isTimerRunning ? '⏸' : '▶'}
                                </button>
                                <button
                                    onClick={resetTimer}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                    title="Reset"
                                >
                                    🔄
                                </button>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Main Split Layout with Resizable Panels */}
                <PanelGroup direction="horizontal" className="flex flex-1 overflow-hidden">

                    {/* LEFT PANEL: Problem Description */}
                    <Panel defaultSize={33} minSize={20} className="flex flex-col border-r border-gray-800 bg-[#0d1117]">
                        {/* Fake Tabs for Left Panel */}
                        <div className="flex items-center h-10 bg-[#111827] border-b border-gray-800 px-2 shrink-0 select-none">
                            <button className="flex items-center gap-2 h-full px-4 border-b-2 border-blue-500 text-blue-400 text-sm font-medium bg-[#0d1117]">
                                <BookOpen className="w-4 h-4" /> Description
                            </button>
                        </div>

                        {/* Scrollable Description Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            {/* Tags and Companies */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {problem.tags && problem.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 rounded bg-gray-800 text-gray-300 text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                                {problem.companies && problem.companies.length > 0 && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 text-purple-400 text-xs font-medium">
                                        <Trophy className="w-3.5 h-3.5" />
                                        {problem.companies.join(', ')}
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-sm md:text-base mb-10">
                                {problem.description}
                            </div>

                            {/* Test Cases */}
                            <div className="space-y-6">
                                <h3 className="font-bold text-gray-200">Examples</h3>
                                {problem.sample_test_cases.map((tc, idx) => (
                                    <div key={idx} className="bg-[#111827] border border-gray-800 rounded-lg p-4 space-y-3 font-mono text-sm shadow-sm">
                                        <div>
                                            <span className="text-gray-500 font-bold block mb-1">Input:</span>
                                            <div className="text-gray-300 break-all">{tc.input}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 font-bold block mb-1">Output:</span>
                                            <div className="text-green-400 break-all">{tc.output}</div>
                                        </div>
                                        {tc.explanation && (
                                            <div>
                                                <span className="text-gray-500 font-bold block mb-1">Explanation:</span>
                                                <div className="text-gray-400 italic font-sans text-sm">{tc.explanation}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>

                    {/* Draggable Divider */}
                    <PanelResizeHandle className="w-1.5 bg-gray-800 hover:bg-blue-500/50 hover:cursor-col-resize active:bg-blue-500 transition-colors flex flex-col justify-center items-center group">
                        <div className="h-8 w-0.5 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
                    </PanelResizeHandle>

                    {/* RIGHT PANEL: Code Editor & Output */}
                    <Panel defaultSize={67} minSize={30} className="flex flex-col bg-[#1e1e1e]">
                        {/* Editor Toolbar */}
                        <div className="flex items-center justify-between h-10 px-4 bg-[#111827] border-b border-gray-800 shrink-0 select-none">
                            <div className="flex items-center gap-3">
                                <Code2 className="w-4 h-4 text-gray-400" />
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="bg-transparent border-none text-white text-sm focus:ring-0 cursor-pointer font-medium p-0"
                                >
                                    {availableLanguages.map(lang => (
                                        <option key={lang} value={lang} className="bg-gray-900">
                                            {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCode(STARTER_CODE[language] || '')}
                                    className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 inline-block mr-1.5 relative -top-px" />
                                    Reset
                                </button>
                                <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning || isSubmitting}
                                    className="px-4 py-1 text-xs font-bold text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors disabled:opacity-50"
                                >
                                    {isRunning ? 'Running...' : 'Run'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || isSubmitting}
                                    className="px-4 py-1 text-xs font-bold text-green-900 bg-green-500 hover:bg-green-400 rounded transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                {showNextButton && nextProblemId && (
                                    <button
                                        onClick={handleNextProblem}
                                        className="px-4 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Editor and Console Resizable Vertical Split */}
                        <PanelGroup direction="vertical" className="flex-1">

                            {/* Editor Component */}
                            <Panel defaultSize={isOutputOpen ? 70 : 100} minSize={30} className="relative">
                                <Editor
                                    height="100%"
                                    defaultLanguage="python"
                                    language={language}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    theme={editorTheme}
                                    onMount={(editor, monaco) => {
                                        // Empty onMount as restrictions have been lifted
                                    }}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 16, bottom: 16 },
                                        scrollBeyondLastLine: false,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        lineNumbers: "on",
                                        renderLineHighlight: "all",
                                        smoothScrolling: true,
                                        cursorBlinking: "smooth",
                                        wordWrap: "on",
                                        automaticLayout: true,
                                        contextmenu: true,
                                        readOnly: false,
                                    }}
                                />
                            </Panel>

                            {/* Resizable Divider (Only show if output is open) */}
                            {isOutputOpen && (
                                <PanelResizeHandle className="h-1.5 bg-gray-800 hover:bg-blue-500/50 hover:cursor-row-resize active:bg-blue-500 transition-colors flex justify-center items-center group relative z-10 w-full">
                                    <div className="w-8 h-0.5 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
                                </PanelResizeHandle>
                            )}

                            {/* Console Panel */}
                            {isOutputOpen && (
                                <Panel defaultSize={30} minSize={20} className="flex flex-col bg-[#111827]">
                                    {/* Console Toolbar */}
                                    <button
                                        onClick={() => setIsOutputOpen(false)}
                                        className="flex items-center justify-between px-4 h-10 w-full bg-[#111827] border-b border-gray-800 hover:bg-gray-800/50 transition-colors select-none shrink-0"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-300">Test Result</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </button>

                                    {/* Console Content */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-[#0a0f1c] font-sans text-sm leading-relaxed custom-scrollbar">
                                        {currentSubmission ? (
                                            <div className="flex flex-col gap-5">
                                                {/* Header Status */}
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xl font-bold ${currentSubmission.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {currentSubmission.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                                    {currentSubmission.execution_time !== undefined && (
                                                        <span className="bg-[#111827] px-3 py-1.5 rounded-md border border-gray-800">
                                                            Runtime: <span className="text-gray-200">{currentSubmission.execution_time}ms</span>
                                                        </span>
                                                    )}
                                                    {currentSubmission.memory_usage !== undefined && (
                                                        <span className="bg-[#111827] px-3 py-1.5 rounded-md border border-gray-800">
                                                            Memory: <span className="text-gray-200">{currentSubmission.memory_usage}KB</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Error Message if any */}
                                                {currentSubmission.status !== 'Accepted' && currentSubmission.message && (
                                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-300 font-mono text-sm whitespace-pre-wrap">
                                                        {currentSubmission.message}
                                                    </div>
                                                )}

                                                {/* Test Case Results */}
                                                {currentSubmission.test_case_results && currentSubmission.test_case_results.length > 0 && (
                                                    <div className="flex flex-col gap-4 mt-2">
                                                        <div className="text-gray-300 font-medium">
                                                            Cases Passed: <span className="text-white font-bold">{currentSubmission.test_cases_passed} / {currentSubmission.total_test_cases}</span>
                                                        </div>
                                                        {currentSubmission.test_case_results.map((tc, idx) => (
                                                            <div key={idx} className="p-4 bg-[#111827] border border-gray-800 rounded-lg space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-gray-300">Test Case {idx + 1}</span>
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${tc.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                        {tc.passed ? 'Passed' : 'Failed'}
                                                                    </span>
                                                                </div>
                                                                
                                                                {!tc.passed && (
                                                                    <div className="grid gap-3 mt-2">
                                                                        <div>
                                                                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Expected Output</span>
                                                                            <pre className="p-3 bg-black/40 rounded border border-gray-800 text-green-400 font-mono text-sm whitespace-pre-wrap">{tc.expected_output}</pre>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Your Output</span>
                                                                            <pre className="p-3 bg-black/40 rounded border border-gray-800 text-red-400 font-mono text-sm whitespace-pre-wrap">{tc.actual_output || "Nothing returned"}</pre>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Simple actual/expected output if no test case array */}
                                                {(!currentSubmission.test_case_results || currentSubmission.test_case_results.length === 0) && currentSubmission.status !== 'Accepted' && (currentSubmission.actual_output || currentSubmission.expected_output) && (
                                                    <div className="grid gap-4 mt-2">
                                                        {currentSubmission.expected_output && (
                                                            <div>
                                                                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Expected Output</span>
                                                                <pre className="p-3 bg-[#111827] rounded border border-gray-800 text-green-400 font-mono text-sm whitespace-pre-wrap">{currentSubmission.expected_output}</pre>
                                                            </div>
                                                        )}
                                                        {currentSubmission.actual_output && (
                                                            <div>
                                                                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Your Output</span>
                                                                <pre className="p-3 bg-[#111827] rounded border border-gray-800 text-red-400 font-mono text-sm whitespace-pre-wrap">{currentSubmission.actual_output}</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Simple actual output if accepted */}
                                                {(!currentSubmission.test_case_results || currentSubmission.test_case_results.length === 0) && currentSubmission.status === 'Accepted' && currentSubmission.actual_output && (
                                                    <div className="grid gap-2 mt-2">
                                                        <div>
                                                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Output</span>
                                                            <pre className="p-3 bg-[#111827] rounded border border-gray-800 text-gray-300 font-mono text-sm whitespace-pre-wrap">{currentSubmission.actual_output}</pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : output ? (
                                            <div className="text-gray-300 font-mono text-sm p-2">{output}</div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-600 select-none">
                                                Run your code to see results here
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            )}
                        </PanelGroup>

                        {/* Collapsed Console Toolbar (Fixed at bottom when closed) */}
                        {!isOutputOpen && (
                            <button
                                onClick={() => setIsOutputOpen(true)}
                                className="flex items-center justify-between px-4 h-10 w-full bg-[#111827] border-t border-gray-800 hover:bg-gray-800/50 transition-colors select-none shrink-0"
                            >
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">Test Result</span>
                                </div>
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                    </Panel>

                </PanelGroup>
            </div>
        </AuthGuard>
    );
}
