/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, RotateCcw, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuizResult } from '@/src/types';

interface ResultsProps {
  result: QuizResult;
  onRestart: () => void;
  onGoHome: () => void;
}

export const Results: React.FC<ResultsProps> = ({ result, onRestart, onGoHome }) => {
  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Score Summary */}
      <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="text-center border-b-2 border-black bg-gray-50">
          <CardTitle className="text-3xl font-black">答题报告</CardTitle>
        </CardHeader>
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-around gap-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * percentage) / 100}
                className="text-black transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black">{percentage}%</span>
              <span className="text-xs font-bold text-gray-500 uppercase">正确率</span>
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">得分</p>
                <p className="text-2xl font-black">{result.score} / {result.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">错题数</p>
                <p className="text-2xl font-black">{result.wrongQuestions.length}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button onClick={onRestart} className="bg-black hover:bg-gray-800 text-white font-bold h-12 px-8">
              <RotateCcw className="w-4 h-4 mr-2" />
              再来一轮
            </Button>
            <Button variant="outline" onClick={onGoHome} className="border-black hover:bg-gray-100 font-bold h-12 px-8">
              <Home className="w-4 h-4 mr-2" />
              返回主页
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wrong Questions Review */}
      {result.wrongQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-black flex items-center gap-2">
            <XCircle className="text-red-500" />
            错题解析
          </h3>
          <div className="space-y-6">
            {result.wrongQuestions.map(({ question, userAnswer }, idx) => (
              <Card key={idx} className="border-2 border-black overflow-hidden">
                <div className="bg-gray-50 p-4 border-b-2 border-black flex justify-between items-center">
                  <Badge variant="outline" className="border-black font-bold uppercase">{question.type}</Badge>
                  <span className="text-sm font-bold text-gray-500">题目 {idx + 1}</span>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg font-bold leading-relaxed">{question.title}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs font-bold text-red-600 uppercase mb-1">你的答案</p>
                      <p className="text-lg font-black text-red-700">
                        {userAnswer} - {question.options[userAnswer as keyof typeof question.options]}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs font-bold text-green-600 uppercase mb-1">正确答案</p>
                      <p className="text-lg font-black text-green-700">
                        {question.correctAnswer} - {question.options[question.correctAnswer as keyof typeof question.options]}
                      </p>
                    </div>
                  </div>

                  {question.analysis && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">解析</p>
                      <p className="text-sm text-blue-800 leading-relaxed">{question.analysis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
