"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, ArrowLeft, Clock, Target, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface AptitudeProblem {
  id: number;
  title: string;
  description: string;
  question_type: string;
  difficulty: string;
  time_limit: number;
  options: string[];
}

interface AptitudeChapter {
  id: number;
  title: string;
  content: string;
  order: number;
  problems: AptitudeProblem[];
}

interface AptitudeEvaluationResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  user_answer: string;
}

export default function AptitudeChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState<AptitudeChapter | null>(null);
  const [chapters, setChapters] = useState<AptitudeChapter[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [evaluation, setEvaluation] = useState<AptitudeEvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all chapters for navigation
        const chaptersResponse = await api.get('/aptitude/chapters');
        setChapters(chaptersResponse.data);
        
        // Fetch current chapter
        const chapterResponse = await api.get(`/aptitude/chapters/${resolvedParams.id}`);
        setChapter(chapterResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchData();
    }
  }, [resolvedParams.id]);

  const allProblems = chapters.flatMap(c => c.problems);
  const currentProblem = chapter?.problems[currentProblemIndex];
  const currentProblemIndexInAll = allProblems.findIndex(p => p.id === currentProblem?.id);
  const prevProblem = currentProblemIndexInAll > 0 ? allProblems[currentProblemIndexInAll - 1] : null;
  const nextProblem = currentProblemIndexInAll < allProblems.length - 1 ? allProblems[currentProblemIndexInAll + 1] : null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentProblem || !selectedAnswer.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/aptitude/evaluate', {
        problem_id: currentProblem.id,
        selected_answer: selectedAnswer,
      });
      
      setEvaluation(response.data);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextProblem = () => {
    if (chapter && currentProblemIndex < chapter.problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setEvaluation(null);
    } else if (nextProblem) {
      // Move to next chapter's first problem
      const nextChapter = chapters.find(c => c.problems.some(p => p.id === nextProblem.id));
      if (nextChapter) {
        router.push(`/aptitude/chapter/${nextChapter.id}`);
      }
    } else {
      // Chapter completed
      router.push('/aptitude');
    }
  };

  const handlePrevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
      setSelectedAnswer('');
      setShowResult(false);
      setEvaluation(null);
    } else if (prevProblem) {
      // Move to previous chapter's last problem
      const prevChapter = chapters.find(c => c.problems.some(p => p.id === prevProblem.id));
      if (prevChapter) {
        const prevProblemIndex = prevChapter.problems.findIndex(p => p.id === prevProblem.id);
        router.push(`/aptitude/chapter/${prevChapter.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!chapter || !currentProblem) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Chapter not found</h1>
            <Link href="/aptitude">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Back to Aptitude
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/aptitude">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Chapters
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <div>
                <h1 className="text-lg font-semibold text-white">{chapter.title}</h1>
                <p className="text-sm text-gray-400">
                  Problem {currentProblemIndex + 1} of {chapter.problems.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevProblem}
                disabled={!prevProblem && currentProblemIndex === 0}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextProblem}
                disabled={!nextProblem && currentProblemIndex === chapter.problems.length - 1}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="glass p-8 rounded-2xl border border-white/5">
          {/* Problem Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(currentProblem.difficulty)}`}>
                {currentProblem.difficulty}
              </span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentProblem.time_limit}s
              </span>
              <span className="text-gray-400 text-sm">
                {currentProblem.question_type === 'MCQ' ? '📝 Multiple Choice' : '🔢 Numerical Answer'}
              </span>
            </div>
          </div>

          {/* Problem Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">{currentProblem.title}</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{currentProblem.description}</p>
          </div>

          {/* Answer Options */}
          {!showResult && (
            <div className="space-y-4">
              {currentProblem.question_type === 'MCQ' ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentProblem.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(index.toString())}
                      className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                        selectedAnswer === index.toString()
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index.toString()
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-600'
                        }`}>
                          {selectedAnswer === index.toString() && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Enter your numerical answer..."
                    className="w-full p-4 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Display */}
          {showResult && evaluation && (
            <div className="space-y-6">
              {/* Result Header */}
              <div className={`p-6 rounded-lg border ${
                evaluation.is_correct
                  ? 'bg-green-500/20 border-green-500/30'
                  : 'bg-red-500/20 border-red-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {evaluation.is_correct ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <span className={`text-xl font-bold ${
                    evaluation.is_correct ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {evaluation.is_correct ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="space-y-2 text-gray-300">
                  <p><strong>Your answer:</strong> {evaluation.user_answer}</p>
                  <p><strong>Correct answer:</strong> {evaluation.correct_answer}</p>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-6 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Explanation</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{evaluation.explanation}</p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrevProblem}
                  disabled={!prevProblem && currentProblemIndex === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <button
                  onClick={handleNextProblem}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {nextProblem || currentProblemIndex < chapter.problems.length - 1 ? (
                    <>
                      Next Problem
                      <ChevronRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Complete Chapter
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
