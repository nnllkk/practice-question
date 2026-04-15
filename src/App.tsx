/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Trophy, FileSpreadsheet, PlayCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUpload } from './components/FileUpload';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { Question, QuizResult, AppState } from './types';

const LAST_RESULT_KEY = 'quiz_last_result';

export default function App() {
  const [state, setState] = useState<AppState>('home');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);

  // Load last result from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LAST_RESULT_KEY);
    if (saved) {
      try {
        setLastResult(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse last result', e);
      }
    }
  }, []);

  const handleDataLoaded = (questions: Question[]) => {
    setAllQuestions(questions);
  };

  const startQuiz = useCallback(() => {
    if (allQuestions.length === 0) return;
    
    // Randomly pick 20 questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(20, allQuestions.length));
    
    setQuizQuestions(selected);
    setState('quiz');
  }, [allQuestions]);

  const handleQuizSubmit = (answers: Record<string, string>) => {
    let score = 0;
    const wrongQuestions: { question: Question; userAnswer: string }[] = [];

    quizQuestions.forEach(q => {
      const userAnswer = answers[q.id] || '';
      if (userAnswer === q.correctAnswer) {
        score++;
      } else {
        wrongQuestions.push({ question: q, userAnswer });
      }
    });

    const result: QuizResult = {
      score,
      total: quizQuestions.length,
      wrongQuestions,
      timestamp: Date.now(),
    };

    setCurrentResult(result);
    setLastResult(result);
    localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
    setState('result');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setState('home')}>
            <div className="bg-black p-1.5 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">智能刷题助手</h1>
          </div>
          {state !== 'home' && (
            <Button variant="ghost" onClick={() => setState('home')} className="font-bold hover:bg-gray-100">
              退出
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {state === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">准备好开始了吗？</h2>
                <p className="text-gray-500 text-lg">上传你的 Excel 题库，开启高效刷题之旅。</p>
              </div>

              {/* Last Score Card */}
              {lastResult && (
                <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-50">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-200 rounded-xl border-2 border-black">
                        <Trophy className="w-8 h-8 text-black" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600 uppercase">上一轮得分</p>
                        <p className="text-3xl font-black">{lastResult.score} / {lastResult.total}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">完成时间</p>
                      <p className="text-sm font-bold">{new Date(lastResult.timestamp).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload Section */}
              <div className="space-y-6">
                <FileUpload onDataLoaded={handleDataLoaded} />
                
                {allQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-600 rounded-full text-green-700 font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                      已加载 {allQuestions.length} 道题目
                    </div>
                    <Button 
                      onClick={startQuiz}
                      className="w-full max-w-sm h-16 text-xl font-black bg-black hover:bg-gray-800 text-white rounded-2xl shadow-[0px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      <PlayCircle className="w-6 h-6 mr-2" />
                      开始答题 (随机20题)
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                <div className="p-4 border-2 border-black rounded-xl bg-white flex gap-3">
                  <Info className="w-5 h-5 shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-bold block text-black mb-1">随机抽题</span>
                    系统将从您的题库中随机抽取 20 道题目，确保每次练习都有新鲜感。
                  </p>
                </div>
                <div className="p-4 border-2 border-black rounded-xl bg-white flex gap-3">
                  <Info className="w-5 h-5 shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-bold block text-black mb-1">错题回顾</span>
                    答题结束后，您可以查看所有错题的详细解析，查漏补缺。
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Quiz questions={quizQuestions} onSubmit={handleQuizSubmit} />
            </motion.div>
          )}

          {state === 'result' && currentResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Results 
                result={currentResult} 
                onRestart={startQuiz} 
                onGoHome={() => setState('home')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-100 text-center">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Smart Quiz Assistant &copy; 2024
        </p>
      </footer>
    </div>
  );
}
