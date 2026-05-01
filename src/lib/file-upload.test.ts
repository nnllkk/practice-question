import test from 'node:test';
import assert from 'node:assert/strict';

import { getAcceptedSpreadsheetFile } from './file-upload';

test('getAcceptedSpreadsheetFile accepts an xlsx file by extension', () => {
  const file = { name: 'question-bank.xlsx', type: '' } as File;

  assert.equal(getAcceptedSpreadsheetFile([file]), file);
});

test('getAcceptedSpreadsheetFile accepts an xlsx file by mime type', () => {
  const file = {
    name: 'question-bank',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  } as File;

  assert.equal(getAcceptedSpreadsheetFile([file]), file);
});

test('getAcceptedSpreadsheetFile rejects non-spreadsheet files', () => {
  const file = { name: 'notes.txt', type: 'text/plain' } as File;

  assert.equal(getAcceptedSpreadsheetFile([file]), null);
});
