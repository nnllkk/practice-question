import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Quiz } from './Quiz';
import type { Question } from '@/src/types';

const sampleQuestions: Question[] = [
  {
    id: 'q-1',
    type: '单选题',
    title: '服务对象休息时间应控制在多长时间？',
    analysis: '',
    correctAnswer: 'A',
    options: {
      A: '10分钟',
      B: '20分钟',
      C: '30分钟',
      D: '60分钟',
    },
  },
];

test('Quiz renders time limit summary when countdown props are provided', () => {
  const html = renderToStaticMarkup(
    <Quiz
      questions={sampleQuestions}
      onSubmit={() => {}}
      timeLimitMinutes={60}
    />
  );

  assert.match(html, /限时 60 分钟/);
  assert.match(html, /60:00/);
});
