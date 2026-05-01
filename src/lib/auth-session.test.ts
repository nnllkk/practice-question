import test from 'node:test';
import assert from 'node:assert/strict';

import { parseStoredIdCard } from './auth-session';

test('parseStoredIdCard accepts a normalized mainland ID card', () => {
  assert.equal(parseStoredIdCard('11010519491231002X'), '11010519491231002X');
});

test('parseStoredIdCard normalizes lowercase x in the checksum', () => {
  assert.equal(parseStoredIdCard('11010519491231002x'), '11010519491231002X');
});

test('parseStoredIdCard rejects empty or malformed values', () => {
  assert.equal(parseStoredIdCard(null), null);
  assert.equal(parseStoredIdCard(''), null);
  assert.equal(parseStoredIdCard('ABC123'), null);
});
