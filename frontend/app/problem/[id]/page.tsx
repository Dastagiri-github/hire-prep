"use client";
import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Terminal, ChevronDown, ChevronUp, Code2, Cpu, Timer } from 'lucide-react';

interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    sample_test_cases: { input: string; output: string; explanation: string }[];
}

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [code, setCode] = useState('// Write your code here');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const [availableLanguages, setAvailableLanguages] = useState<string[]>(['python', 'javascript']);
    const [isOutputOpen, setIsOutputOpen] = useState(true);

    const STARTER_CODE: Record<string, string> = {
        python: `def solution():
    # Write your code here
    pass`,
        cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

class Solution {
public:
    // Implement your solution here
    void solve(vector<int>& nums, int target) {
        // Example output format
        cout << "[0,1]" << endl;
    }
};

int main() {
    // Input parsing wrapper
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) {
            cin >> nums[i];
        }
        int target;
        cin >> target;
        
        Solution sol;
        sol.solve(nums, target);
    }
    return 0;
}`,
        java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
        javascript: `function solution() {
    // Write your code here
}`
    };

    useEffect(() => {
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
    }, [resolvedParams.id]);

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

            if (response.data.status !== 'Accepted' && response.data.message) {
                outputMsg += `\n\nError: ${response.data.message}`;
                if (response.data.expected_output) outputMsg += `\nExpected: ${response.data.expected_output}`;
                if (response.data.actual_output) outputMsg += `\nActual:   ${response.data.actual_output}`;
            } else if (response.data.status === 'Accepted') {
                outputMsg += `\n\n${response.data.message}`;
                if (response.data.actual_output) {
                    outputMsg += `\nOutput: ${response.data.actual_output}`;
                }
            }

            setOutput(outputMsg);
        } catch (error) {
            setOutput('Error executing code. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

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
        <div className="flex flex-col lg:flex-row h-screen pt-20 pb-4 px-4 gap-4 max-w-[1920px] mx-auto overflow-hidden">
            {/* Left Panel: Problem Description */}
            <div className="w-full lg:w-[35%] flex flex-col h-full animate-fade-in">
                <div className="glass-panel p-0 rounded-2xl flex-1 flex flex-col overflow-hidden border border-white/10 shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent mb-3 leading-tight">
                                    {problem.title}
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border shadow-sm ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10' :
                                        problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10' :
                                            'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                    {problem.tags && problem.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/5 text-blue-300 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-10">
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-sm">
                            {problem.description}
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-sm flex items-center gap-2 text-white uppercase tracking-wider">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                Sample Test Cases
                            </h3>
                            {problem.sample_test_cases.map((tc, idx) => (
                                <div key={idx} className="bg-black/40 rounded-xl border border-white/5 overflow-hidden group hover:border-blue-500/20 transition-colors">
                                    <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs font-mono text-gray-400 flex items-center justify-between">
                                        <span>Test Case {idx + 1}</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                                            <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4 font-mono text-xs">
                                        <div>
                                            <span className="text-gray-500 block mb-1.5 text-[10px] uppercase tracking-wider font-bold">Input</span>
                                            <div className="bg-black/50 p-3 rounded-lg text-gray-300 border border-white/5 group-hover:border-white/10 transition-colors">{tc.input}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block mb-1.5 text-[10px] uppercase tracking-wider font-bold">Output</span>
                                            <div className="bg-black/50 p-3 rounded-lg text-green-400 border border-white/5 group-hover:border-white/10 transition-colors">{tc.output}</div>
                                        </div>
                                        {tc.explanation && (
                                            <div>
                                                <span className="text-gray-500 block mb-1.5 text-[10px] uppercase tracking-wider font-bold">Explanation</span>
                                                <div className="text-gray-400 italic bg-white/5 p-3 rounded-lg border border-white/5">{tc.explanation}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="w-full lg:w-[65%] flex flex-col gap-4 h-full animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="glass-panel p-2 rounded-xl flex justify-between items-center border border-white/10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-lg border border-white/5">
                            <Code2 className="w-4 h-4 text-blue-400" />
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                className="bg-transparent border-none text-white text-sm focus:ring-0 cursor-pointer font-medium"
                            >
                                {availableLanguages.map(lang => (
                                    <option key={lang} value={lang} className="bg-gray-900">
                                        {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCode(STARTER_CODE[language] || '')}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Reset Code"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                        >
                            {isRunning ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 fill-current" />
                            )}
                            Run Code
                        </button>
                    </div>
                </div>

                <div className="flex-grow glass-panel rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-[#1e1e1e]">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 24, bottom: 24 },
                                scrollBeyondLastLine: false,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                lineNumbers: "on",
                                renderLineHighlight: "all",
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                            }}
                        />
                    </div>
                </div>

                <div className={`${isOutputOpen ? 'h-64' : 'h-11'} glass-panel rounded-xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out border border-white/10 shadow-xl`}>
                    <div
                        className="bg-white/5 px-4 py-2.5 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setIsOutputOpen(!isOutputOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Console Output</span>
                        </div>
                        {isOutputOpen ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    {isOutputOpen && (
                        <div className="p-0 font-mono text-sm overflow-y-auto custom-scrollbar flex-1 bg-[#0d1117]">
                            {output ? (
                                <div className="p-4">
                                    <pre className={`whitespace-pre-wrap ${output.includes('Error') ? 'text-red-400' :
                                        output.includes('Accepted') ? 'text-green-400' : 'text-gray-300'
                                        }`}>
                                        {output}
                                    </pre>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                    <Cpu className="w-8 h-8 mb-3 opacity-20" />
                                    <div className="text-xs font-medium">Run your code to see output here...</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
