/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { Question } from '@/src/types';
import { cn } from '@/lib/utils';
import { getAcceptedSpreadsheetFile } from '@/src/lib/file-upload';

interface FileUploadProps {
  onDataLoaded: (questions: Question[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const parseAndLoadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const parsedQuestions: Question[] = data.map((row, index) => ({
        id: `q-${index}`,
        type: row['题型'] || '单选题',
        title: row['标题'] || '',
        analysis: row['解析'] || '',
        correctAnswer: String(row['正确答案'] || '').trim(),
        options: {
          A: String(row['选项A'] || ''),
          B: String(row['选项B'] || ''),
          C: String(row['选项C'] || ''),
          D: String(row['选项D'] || ''),
        },
      }));

      onDataLoaded(parsedQuestions);
      setErrorMessage('');
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  const handleSelectedFiles = useCallback((files: File[] | FileList | null | undefined) => {
    const file = getAcceptedSpreadsheetFile(files);
    if (!file) {
      setErrorMessage('仅支持上传 .xlsx 格式的题库文件。');
      return;
    }

    parseAndLoadFile(file);
  }, [parseAndLoadFile]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectedFiles(e.target.files);
    e.target.value = '';
  }, [handleSelectedFiles]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
      return;
    }
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    handleSelectedFiles(e.dataTransfer.files);
  }, [handleSelectedFiles]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
        isDragActive
          ? 'border-black bg-yellow-50'
          : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'
      )}
    >
      <Upload className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">上传题库文件</h3>
      <p className="text-sm text-gray-500 mb-6 text-center">
        支持拖拽或选择 .xlsx 格式文件<br />
        列名：题型、标题、解析、正确答案、选项A、选项B、选项C、选项D
      </p>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground'
        )}
      >
        选择文件
      </label>
      <p className="mt-3 text-sm font-medium text-gray-500">
        {isDragActive ? '松开以上传文件' : '也可以将文件直接拖拽到此区域'}
      </p>
      {errorMessage && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
