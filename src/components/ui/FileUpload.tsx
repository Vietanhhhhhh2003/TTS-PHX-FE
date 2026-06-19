'use client';

import { useRef } from 'react';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  files?: { name: string; url: string }[];
  onFilesChange: (files: { name: string; url: string }[]) => void;
  label?: string;
}

export function FileUpload({
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = true,
  files = [],
  onFilesChange,
  label = 'Tải lên tài liệu',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const newFiles = selected.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    onFilesChange([...files, ...newFiles]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeFile(idx: number) {
    onFilesChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, JPEG, PNG</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded px-3 py-1.5">
              <span className="truncate max-w-xs">{f.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
