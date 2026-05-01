import test from 'node:test';
import assert from 'node:assert/strict';

import { clampQuestionCount, DEFAULT_QUIZ_SETTINGS, formatRemainingTime } from './quiz-settings';

test('DEFAULT_QUIZ_SETTINGS uses 50 questions and 30 minutes', () => {
  assert.equal(DEFAULT_QUIZ_SETTINGS.questionCount, 50);
  assert.equal(DEFAULT_QUIZ_SETTINGS.timeLimitMinutes, 30);
});

test('clampQuestionCount caps requested question count by available questions', () => {
  assert.equal(clampQuestionCount(100, 68), 68);
  assert.equal(clampQuestionCount(30, 68), 30);
});

test('formatRemainingTime renders minutes and seconds', () => {
  assert.equal(formatRemainingTime(3600), '60:00');
  assert.equal(formatRemainingTime(65), '01:05');
  assert.equal(formatRemainingTime(9), '00:09');
});
