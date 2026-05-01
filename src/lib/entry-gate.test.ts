import test from 'node:test';
import assert from 'node:assert/strict';

import { generateEntryKey, isValidMainlandChinaIdCard } from './entry-gate';

test('generateEntryKey returns a 6-character uppercase alphanumeric key', () => {
  const key = generateEntryKey();

  assert.equal(key.length, 6);
  assert.match(key, /^[A-Z0-9]{6}$/);
});

test('isValidMainlandChinaIdCard accepts a valid 18-digit mainland ID card', () => {
  assert.equal(isValidMainlandChinaIdCard('11010519491231002X'), true);
});

test('isValidMainlandChinaIdCard rejects an invalid checksum', () => {
  assert.equal(isValidMainlandChinaIdCard('110105194912310021'), false);
});

test('isValidMainlandChinaIdCard rejects an invalid date segment', () => {
  assert.equal(isValidMainlandChinaIdCard('11010519491331002X'), false);
});
