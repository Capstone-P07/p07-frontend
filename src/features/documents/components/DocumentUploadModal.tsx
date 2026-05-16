import React, { useState } from 'react';
import { useUploadDocument } from '../hooks/useUploadDocument';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // BE multer 한도와 동일

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void; // 업로드 성공 시 부모(useDocuments.refetch) 트리거
}

export default function DocumentUploadModal({ isOpen, onClose, onUploaded }: DocumentUploadModalProps) {
  const { upload, isUploading, error } = useUploadDocument();

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setTitle('');
    setFile(null);
    setUrl('');
    setLocalError(null);
  };

  const handleClose = () => {
    if (isUploading) return;
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setLocalError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.name.toLowerCase().endsWith('.md')) {
      setLocalError('Markdown(.md) 파일만 업로드 가능합니다.');
      setFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setLocalError('파일 크기는 5MB 이하여야 합니다.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      setLocalError('업로드할 .md 파일을 선택하세요.');
      return;
    }
    try {
      await upload({ source: 'file', file, title: title || undefined, url:url || undefined });
      onUploaded?.();
      reset();
      onClose();
    } catch {
      // hook 의 error 가 이미 set됨
    }
  };

  const displayError = localError ?? error;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  문서 업로드
                </h3>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">문서 제목 (선택)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      placeholder="비워두면 파일에서 첫 H1을 사용합니다"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">원본 문서 URL (선택)</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      placeholder="https://docs.riido.io/..."
                    />
                  </div>

                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>{file ? file.name : '파일 선택'}</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".md,text/markdown,text/plain"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Markdown(.md) 파일 (최대 5MB)
                      </p>
                    </div>
                  </div>

                  {displayError && (
                    <p className="text-sm text-red-600">{displayError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={isUploading || !file}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {isUploading ? '업로드 중…' : '업로드 및 인덱싱 시작'}
            </button>
            <button
              type="button"
              disabled={isUploading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              onClick={handleClose}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
