"use client";
import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Terminal, ChevronDown, ChevronUp, Code2, Cpu, Timer, ChevronLeft, ChevronRight, Send, Clock, Trophy, Users, Star, BookOpen, Target } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

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
        return () => window.removeEventListener('themechange', handler);
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
        try {
            const response = await api.post('/submissions/', {
                problem_id: resolvedParams.id,
                code: code,
                language: language
            });

            let outputMsg = `Status: ${response.data.status}\nExecution Time: ${response.data.execution_time}ms`;
            
            if (response.data.memory_usage) {
                outputMsg += `\nMemory Usage: ${response.data.memory_usage}KB`;
            }

            if (response.data.status !== 'Accepted' && response.data.message) {
                outputMsg += `\n\nError: ${response.data.message}`;
                if (response.data.expected_output) outputMsg += `\nExpected: ${response.data.expected_output}`;
                if (response.data.actual_output) outputMsg += `\nActual:   ${response.data.actual_output}`;
            } else if (response.data.status === 'Accepted') {
                outputMsg += `\n\n${response.data.message}`;
                if (response.data.actual_output) {
                    outputMsg += `\nOutput: ${response.data.actual_output}`;
                }
                if (response.data.test_cases_passed !== undefined) {
                    outputMsg += `\nTest Cases Passed: ${response.data.test_cases_passed}/${response.data.total_test_cases}`;
                }
            }

            setOutput(outputMsg);
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

            let outputMsg = `🎯 Test Results:\n\n`;
            
            if (submissionData.test_case_results && submissionData.test_case_results.length > 0) {
                outputMsg += `Total Test Cases: ${submissionData.total_test_cases}\n`;
                outputMsg += `Passed: ${submissionData.test_cases_passed}\n`;
                outputMsg += `Failed: ${submissionData.total_test_cases! - submissionData.test_cases_passed!}\n\n`;
                
                // Show individual test case results
                submissionData.test_case_results.forEach((testCase, index) => {
                    outputMsg += `Test Case ${index + 1}: ${testCase.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
                    if (!testCase.passed) {
                        outputMsg += `  Expected: ${testCase.expected_output}\n`;
                        outputMsg += `  Your Output: ${testCase.actual_output}\n`;
                    }
                    outputMsg += `  Time: ${testCase.execution_time}ms\n\n`;
                });
            } else {
                outputMsg += `Status: ${submissionData.status}\n`;
                outputMsg += `Execution Time: ${submissionData.execution_time}ms\n`;
            }
            
            if (submissionData.memory_usage) {
                outputMsg += `Memory Usage: ${submissionData.memory_usage}KB\n`;
            }

            if (submissionData.status === 'Accepted') {
                outputMsg += `\n🎉 Congratulations! Your solution has been accepted!\n`;
                outputMsg += `All test cases passed successfully!\n`;
                setShowNextButton(true);
                fetchNextRecommendedProblem(true);
                // Note: Solved problems are automatically tracked when submission is successful
            } else if (submissionData.status === 'Wrong Answer') {
                outputMsg += `\n❌ Wrong Answer. Please check your logic.\n`;
                if (submissionData.test_cases_passed !== undefined) {
                    outputMsg += `Test Cases Passed: ${submissionData.test_cases_passed}/${submissionData.total_test_cases}\n`;
                }
            } else if (submissionData.status === 'Time Limit Exceeded') {
                outputMsg += `\n⏱️ Time Limit Exceeded. Your solution took too long to run.\n`;
            } else if (submissionData.status === 'Compilation Error') {
                outputMsg += `\n🔧 Compilation Error: ${submissionData.message}\n`;
            } else if (submissionData.status === 'Runtime Error') {
                outputMsg += `\n💥 Runtime Error: ${submissionData.message}\n`;
            }

            setOutput(outputMsg);
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
        <div className="flex items-center justify-center min-h-screen pt-20">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 animate-pulse">Loading problem...</p>
            </div>
        </div>
    );

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 pt-4 pb-4">
                {/* Header */}
                <div className="max-w-[1400px] mx-auto px-6 mb-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back to Problems
                                </button>
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-blue-400" />
                                    <span className="text-white font-semibold text-lg">Problem #{problem.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                                    <Timer className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 text-sm font-mono font-medium">{formatTime(elapsedTime)}</span>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={isTimerRunning ? pauseTimer : resumeTimer}
                                            className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                                            title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                                        >
                                            {isTimerRunning ? 
                                                <span className="text-xs">⏸</span> : 
                                                <span className="text-xs">▶</span>
                                            }
                                        </button>
                                        <button
                                            onClick={resetTimer}
                                            className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                                            title="Reset Timer"
                                        >
                                            <span className="text-xs">🔄</span>
                                        </button>
                                    </div>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 items-start">
                        {/* Left Panel - Problem Description and Test Cases */}
                        <div className="space-y-4">
                            {/* Problem Header */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-semibold text-white mb-3">
                                        {problem.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                        {problem.tags && problem.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-3 py-2 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                                {tag}
                                            </span>
                                        ))}
                                        {problem.companies && problem.companies.length > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                                <Trophy className="w-4 h-4 text-purple-400" />
                                                <span className="text-purple-300 text-sm">{problem.companies.slice(0, 2).join(', ')}</span>
                                                {problem.companies.length > 2 && <span className="text-purple-400 text-xs">+{problem.companies.length - 2}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Problem Description */}
                                <div className="prose prose-invert max-w-[650px] text-gray-300 leading-relaxed mb-6">
                                    {problem.description}
                                </div>

                                {/* Sample Test Cases */}
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-3 text-white mb-6">
                                        <Terminal className="w-5 h-5 text-blue-400" />
                                        Sample Test Cases
                                    </h3>
                                    {problem.sample_test_cases.map((tc, idx) => (
                                        <div key={idx} className="bg-black/40 rounded-xl border border-white/10 overflow-hidden mb-6">
                                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-3 border-b border-white/10 text-sm font-mono text-blue-300 flex items-center justify-between">
                                                <span className="font-semibold">Test Case {idx + 1}</span>
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500/30"></div>
                                                    <div className="w-2 h-2 rounded-full bg-green-500/30"></div>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3 font-mono text-sm">
                                                <div>
                                                    <span className="text-gray-400 block mb-2 text-xs uppercase tracking-wider font-bold">Input</span>
                                                    <div className="bg-black/60 p-4 rounded-lg text-gray-200 border border-white/10 font-mono">{tc.input}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block mb-2 text-xs uppercase tracking-wider font-bold">Output</span>
                                                    <div className="bg-black/60 p-4 rounded-lg text-green-400 border border-white/10 font-mono">{tc.output}</div>
                                                </div>
                                                {tc.explanation && (
                                                    <div>
                                                        <span className="text-gray-400 block mb-2 text-xs uppercase tracking-wider font-bold">Explanation</span>
                                                        <div className="text-gray-300 italic bg-white/5 p-4 rounded-lg border border-white/10">{tc.explanation}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Code Editor */}
                        <div className="space-y-4">
                            {/* Editor Controls */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
                                {/* Top Row - Language and Reset */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 shadow-inner">
                                            <Code2 className="w-5 h-5 text-blue-400" />
                                            <select
                                                value={language}
                                                onChange={handleLanguageChange}
                                                className="bg-transparent border-none text-white text-sm focus:ring-0 cursor-pointer font-medium min-w-[120px]"
                                            >
                                                {availableLanguages.map(lang => (
                                                    <option key={lang} value={lang} className="bg-gray-900">
                                                        {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setCode(STARTER_CODE[language] || '')}
                                            className="flex items-center gap-2.5 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            <span>Reset Code</span>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Bottom Row - Action Buttons */}
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        onClick={handleRun}
                                        disabled={isRunning || isSubmitting}
                                        className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                                    >
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative flex items-center gap-3">
                                            {isRunning ? (
                                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Play className="w-5 h-5 fill-current" />
                                            )}
                                            <span className="font-semibold">{isRunning ? 'Running...' : 'Run Code'}</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isRunning || isSubmitting}
                                        className="group relative flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-400 hover:to-green-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                                    >
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative flex items-center gap-3">
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5 fill-current" />
                                            )}
                                            <span className="font-semibold">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                                        </div>
                                    </button>
                                    {showNextButton && nextProblemId && (
                                        <button
                                            onClick={handleNextProblem}
                                            className="group relative flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-500 hover:via-pink-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1"
                                        >
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative flex items-center gap-3">
                                                <span className="font-semibold">Next Problem</span>
                                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
                                <div className="h-[520px] bg-[#1e1e1e]">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="python"
                                        language={language}
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        theme={editorTheme}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 15,
                                            padding: { top: 25, bottom: 25 },
                                            scrollBeyondLastLine: false,
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            lineNumbers: "on",
                                            renderLineHighlight: "all",
                                            smoothScrolling: true,
                                            cursorBlinking: "smooth",
                                            cursorSmoothCaretAnimation: "on",
                                            wordWrap: "on",
                                            automaticLayout: true,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Output Console */}
                            <div className={`${isOutputOpen ? 'h-64' : 'h-14'} bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out border border-white/20 shadow-xl`}>
                                <div
                                    className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-4 py-4 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => setIsOutputOpen(!isOutputOpen)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Terminal className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">Console Output</span>
                                    </div>
                                    {isOutputOpen ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                {isOutputOpen && (
                                    <div className="flex-1 font-mono text-sm overflow-y-auto bg-[#0d1117]">
                                        {output ? (
                                            <div className="p-4">
                                                <pre className={`whitespace-pre-wrap leading-relaxed ${
                                                    output.includes('Accepted') ? 'text-green-400' :
                                                    output.includes('Wrong Answer') ? 'text-red-400' :
                                                    output.includes('Error') || output.includes('Compilation Error') || output.includes('Runtime Error') ? 'text-red-400' :
                                                    output.includes('Time Limit Exceeded') ? 'text-yellow-400' :
                                                    'text-gray-300'
                                                }`}>
                                                    {output}
                                                </pre>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-600 py-8">
                                                <Cpu className="w-10 h-10 mb-4 opacity-30" />
                                                <div className="text-sm font-medium">Run your code to see output here...</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
