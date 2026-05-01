/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Question } from '@/src/types';
import { cn } from '@/lib/utils';

interface QuizProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Group questions by type for the sidebar
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, number[]> = {};
    questions.forEach((q, idx) => {
      if (!groups[q.type]) groups[q.type] = [];
      groups[q.type].push(idx);
    });
    return groups;
  }, [questions]);

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[70vh] md:h-[min(80vh,calc(100dvh-12rem))] flex flex-col md:flex-row border-2 border-black bg-white md:overflow-hidden shadow-2xl">
      {/* Left: Question Content */}
      <div className="flex-1 min-h-0 p-6 md:p-10 flex flex-col relative">
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl font-bold">{currentIndex + 1}、</span>
            <h2 className="text-xl font-medium leading-relaxed">{currentQuestion.title}</h2>
          </div>

          <div className="space-y-4 mt-8">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              if (!value) return null;
              const isSelected = answers[currentQuestion.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left group",
                    isSelected 
                      ? "border-black bg-black text-white" 
                      : "border-gray-200 hover:border-black bg-white"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold shrink-0",
                    isSelected ? "border-white" : "border-black group-hover:bg-black group-hover:text-white"
                  )}>
                    {key}
                  </div>
                  <span className="text-lg">{value}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation (visible only on small screens) */}
        <div className="md:hidden sticky bottom-0 mt-6 border-t bg-white pt-4 pb-1">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex-1" onClick={goToPrev} disabled={currentIndex === 0}>
            上一题
            </Button>
            <Button variant="outline" className="flex-1" onClick={goToNext} disabled={currentIndex === questions.length - 1}>
            下一题
            </Button>
            <Button onClick={() => onSubmit(answers)} className="flex-1 bg-black hover:bg-gray-800">
              提交
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Sidebar */}
      <div className="w-full md:w-80 min-h-0 border-t-2 md:border-t-0 md:border-l-2 border-black flex flex-col bg-gray-50">
        {/* ID Photo Placeholder */}
        <div className="p-6 flex flex-col items-center border-b border-gray-200">
          <div className="w-32 h-40 border-2 border-black rounded-lg flex flex-col items-center justify-center bg-white shadow-sm">
            <User className="w-12 h-12 text-gray-300" />
            <span className="mt-2 text-sm font-bold text-gray-400">证件照</span>
          </div>
        </div>

        {/* Question Grid */}
        <ScrollArea className="min-h-0 flex-1 p-4">
          {Object.entries(groupedQuestions).map(([type, indices]) => (
            <div key={type} className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-600 uppercase tracking-wider">{type}</h3>
              <div className="grid grid-cols-5 gap-2">
                {(indices as number[]).map((idx) => {
                  const isAnswered = !!answers[questions[idx].id];
                  const isCurrent = currentIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
                        isCurrent ? "border-black bg-black text-white scale-110 z-10" : 
                        isAnswered ? "border-black bg-gray-200" : "border-gray-300 hover:border-black"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Desktop Navigation Buttons */}
        <div className="hidden md:flex flex-col sticky bottom-0 p-4 gap-2 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 border-black hover:bg-black hover:text-white" 
              onClick={goToPrev} 
              disabled={currentIndex === 0}
            >
              上一题
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-black hover:bg-black hover:text-white" 
              onClick={goToNext} 
              disabled={currentIndex === questions.length - 1}
            >
              下一题
            </Button>
          </div>
          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-6"
            onClick={() => onSubmit(answers)}
          >
            <Send className="w-4 h-4 mr-2" />
            提交试卷
          </Button>
        </div>
      </div>
    </div>
  );
};
