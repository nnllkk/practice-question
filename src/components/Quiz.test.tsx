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

test('Quiz keeps mobile and desktop navigation visible in constrained viewports', () => {
  const html = renderToStaticMarkup(<Quiz questions={sampleQuestions} onSubmit={() => {}} />);

  assert.match(html, /md:hidden sticky bottom-0/);
  assert.match(html, /md:h-\[min\(80vh,calc\(100dvh-12rem\)\)\]/);
  assert.match(html, /hidden md:flex flex-col sticky bottom-0/);
  assert.doesNotMatch(html, /class="[^"]*\sh-\[80vh\][^"]*"/);
});
