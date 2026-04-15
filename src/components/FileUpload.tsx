/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Question } from '@/src/types';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onDataLoaded: (questions: Question[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <Upload className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">上传题库文件</h3>
      <p className="text-sm text-gray-500 mb-6 text-center">
        支持 .xlsx 格式<br />
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
          buttonVariants({ variant: "outline" }),
          "cursor-pointer"
        )}
      >
        选择文件
      </label>
    </div>
  );
};
