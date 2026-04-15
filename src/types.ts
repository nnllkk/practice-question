/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  type: string; // 题型
  title: string; // 标题
  analysis: string; // 解析
  correctAnswer: string; // 正确答案
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface QuizResult {
  score: number;
  total: number;
  wrongQuestions: {
    question: Question;
    userAnswer: string;
  }[];
  timestamp: number;
}

export type AppState = 'home' | 'quiz' | 'result';
