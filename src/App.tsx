/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Trophy, FileSpreadsheet, PlayCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { parseStoredIdCard } from '@/src/lib/auth-session';
import { generateEntryKey, isValidMainlandChinaIdCard } from '@/src/lib/entry-gate';
import { clampQuestionCount, DEFAULT_QUIZ_SETTINGS } from '@/src/lib/quiz-settings';
import { FileUpload } from './components/FileUpload';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { Question, QuizResult, AppState } from './types';

const LAST_RESULT_KEY = 'quiz_last_result';
const AUTHENTICATED_ID_CARD_KEY = 'quiz_authenticated_id_card';
type EntryGateStep = 'key' | 'id';

export default function App() {
  const [state, setState] = useState<AppState>('home');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [entryKey, setEntryKey] = useState('');
  const [entryKeyInput, setEntryKeyInput] = useState('');
  const [idCardInput, setIdCardInput] = useState('');
  const [entryGateStep, setEntryGateStep] = useState<EntryGateStep>('key');
  const [entryGateError, setEntryGateError] = useState('');
  const [authenticatedIdCard, setAuthenticatedIdCard] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUIZ_SETTINGS.questionCount);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(DEFAULT_QUIZ_SETTINGS.timeLimitMinutes);

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

    setAuthenticatedIdCard(parseStoredIdCard(localStorage.getItem(AUTHENTICATED_ID_CARD_KEY)));
  }, []);

  const resetEntryGate = useCallback(() => {
    setEntryKey(generateEntryKey());
    setEntryKeyInput('');
    setIdCardInput('');
    setEntryGateError('');
    setEntryGateStep('key');
  }, []);

  useEffect(() => {
    if (state === 'home' && !authenticatedIdCard) {
      resetEntryGate();
    }
  }, [authenticatedIdCard, resetEntryGate, state]);

  const handleDataLoaded = (questions: Question[]) => {
    setAllQuestions(questions);
  };

  const handleEntryKeySubmit = () => {
    if (entryKeyInput.trim() !== entryKey) {
      setEntryGateError('输入的口令不正确，请重新输入。');
      return;
    }

    setEntryGateError('');
    setEntryGateStep('id');
  };

  const handleIdCardSubmit = () => {
    if (!isValidMainlandChinaIdCard(idCardInput)) {
      setEntryGateError('请输入有效的中国大陆 18 位身份证号。');
      return;
    }

    const normalizedIdCard = idCardInput.trim().toUpperCase();
    setEntryGateError('');
    setAuthenticatedIdCard(normalizedIdCard);
    localStorage.setItem(AUTHENTICATED_ID_CARD_KEY, normalizedIdCard);
  };

  const handleGoHome = () => {
    setState('home');
  };

  const handleLogout = () => {
    setAuthenticatedIdCard(null);
    localStorage.removeItem(AUTHENTICATED_ID_CARD_KEY);
    setState('home');
  };

  const startQuiz = useCallback(() => {
    if (allQuestions.length === 0) return;
    
    const normalizedQuestionCount = clampQuestionCount(questionCount, allQuestions.length);
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, normalizedQuestionCount);
    
    setQuizQuestions(selected);
    setState('quiz');
  }, [allQuestions, questionCount]);

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome}>
              <div className="bg-black p-1.5 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter">智能刷题助手</h1>
            </div>
            {state !== 'home' && (
              <Button variant="ghost" onClick={handleGoHome} className="font-bold hover:bg-gray-100">
                返回首页
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {authenticatedIdCard && (
              <div className="rounded-full border-2 border-black bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 md:px-4 md:text-sm">
                用户：{authenticatedIdCard}
              </div>
            )}
            {state === 'home' && authenticatedIdCard && (
              <Button variant="ghost" onClick={handleLogout} className="font-bold hover:bg-gray-100">
                退出登录
              </Button>
            )}
          </div>
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
                    className="mx-auto w-full max-w-xl flex flex-col items-center gap-4"
                  >
                    <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-center bg-green-50 border-2 border-green-600 rounded-full text-green-700 font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                      已加载 {allQuestions.length} 道题目
                    </div>
                    <Card className="mx-auto w-full border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <CardContent className="grid gap-4 p-6 text-center md:grid-cols-2">
                        <label className="space-y-2 text-center">
                          <span className="block text-sm font-bold text-gray-700">抽题数量</span>
                          <input
                            type="number"
                            min={1}
                            max={allQuestions.length}
                            value={questionCount}
                            onChange={(event) => {
                              const nextValue = Number(event.target.value);
                              setQuestionCount(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
                            }}
                            className="mx-auto h-12 w-full rounded-xl border-2 border-black px-4 text-center text-lg font-bold outline-none focus:ring-4 focus:ring-black/10"
                          />
                          <p className="text-xs text-gray-500">默认 50 题，最多可抽取 {allQuestions.length} 题。</p>
                        </label>
                        <label className="space-y-2 text-center">
                          <span className="block text-sm font-bold text-gray-700">答题时长（分钟）</span>
                          <input
                            type="number"
                            min={1}
                            value={timeLimitMinutes}
                            onChange={(event) => {
                              const nextValue = Number(event.target.value);
                              setTimeLimitMinutes(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
                            }}
                            className="mx-auto h-12 w-full rounded-xl border-2 border-black px-4 text-center text-lg font-bold outline-none focus:ring-4 focus:ring-black/10"
                          />
                          <p className="text-xs text-gray-500">默认 30 分钟，时间结束后自动交卷。</p>
                        </label>
                      </CardContent>
                    </Card>
                    <Button 
                      onClick={startQuiz}
                      className="w-full max-w-sm h-16 text-xl font-black bg-black hover:bg-gray-800 text-white rounded-2xl shadow-[0px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      <PlayCircle className="w-6 h-6 mr-2" />
                      开始答题（{Math.min(questionCount, allQuestions.length)}题 / {timeLimitMinutes}分钟）
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                <div className="p-4 border-2 border-black rounded-xl bg-white flex gap-3">
                  <Info className="w-5 h-5 shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-bold block text-black mb-1">自定义抽题</span>
                    您可以自行设置本轮抽题数量，系统会按设置从题库中随机抽取题目。
                  </p>
                </div>
                <div className="p-4 border-2 border-black rounded-xl bg-white flex gap-3">
                  <Info className="w-5 h-5 shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-bold block text-black mb-1">限时练习</span>
                    支持设置答题时长，倒计时结束后系统会自动交卷。
                  </p>
                </div>
                <div className="p-4 border-2 border-black rounded-xl bg-white flex gap-3 md:col-span-2">
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
              <Quiz questions={quizQuestions} onSubmit={handleQuizSubmit} timeLimitMinutes={timeLimitMinutes} />
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
                onGoHome={handleGoHome} 
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

      {state === 'home' && !authenticatedIdCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md border-2 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-black tracking-tight">
                {entryGateStep === 'key' ? '请输入口令' : '请输入身份证号'}
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                {entryGateStep === 'key'
                  ? `请在下方输入框输入该口令：${entryKey}`
                  : '请输入中国大陆 18 位身份证号，校验通过后才能进入首页。'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {entryGateStep === 'key' ? (
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={entryKeyInput}
                  onChange={(event) => {
                    setEntryKeyInput(event.target.value.replace(/\D/g, '').slice(0, 6));
                    if (entryGateError) {
                      setEntryGateError('');
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleEntryKeySubmit();
                    }
                  }}
                  maxLength={6}
                  placeholder="请输入 6 位数字口令"
                  className="h-12 w-full rounded-xl border-2 border-black px-4 text-lg font-bold tracking-[0.3em] outline-none focus:ring-4 focus:ring-black/10"
                />
              ) : (
                <input
                  autoFocus
                  type="text"
                  value={idCardInput}
                  onChange={(event) => {
                    setIdCardInput(event.target.value.toUpperCase());
                    if (entryGateError) {
                      setEntryGateError('');
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleIdCardSubmit();
                    }
                  }}
                  maxLength={18}
                  placeholder="请输入 18 位身份证号"
                  className="h-12 w-full rounded-xl border-2 border-black px-4 text-lg font-bold outline-none focus:ring-4 focus:ring-black/10"
                />
              )}

              {entryGateError && (
                <p className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {entryGateError}
                </p>
              )}

              <Button
                onClick={entryGateStep === 'key' ? handleEntryKeySubmit : handleIdCardSubmit}
                className="h-12 w-full rounded-xl bg-black text-base font-black text-white hover:bg-gray-800"
              >
                {entryGateStep === 'key' ? '验证口令' : '验证身份证号'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
