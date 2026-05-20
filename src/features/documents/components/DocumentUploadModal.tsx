import React, { useMemo, useRef, useState } from 'react';
import { uploadDocument } from '../api';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type UploadMode = 'file' | 'url';
type QueueStatus = 'pending' | 'uploading' | 'indexing' | 'done' | 'failed';

interface QueuedFile {
  id: string;
  file: File;
  status: QueueStatus;
  message?: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void;
}

const statusLabel: Record<QueueStatus, string> = {
  pending: '대기',
  uploading: '업로드 중',
  indexing: '색인 중',
  done: '완료',
  failed: '실패',
};

export default function DocumentUploadModal({ isOpen, onClose, onUploaded }: DocumentUploadModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<UploadMode>('file');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canSubmit = useMemo(() => {
    if (isProcessing) return false;
    if (mode === 'file') return queue.some((item) => item.status === 'pending' || item.status === 'failed');
    return url.trim().length > 0;
  }, [isProcessing, mode, queue, url]);

  if (!isOpen) return null;

  const reset = () => {
    setTitle('');
    setUrl('');
    setQueue([]);
    setLocalError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (isProcessing) return;
    reset();
    onClose();
  };

  const validateFiles = (files: File[]) => {
    const valid: QueuedFile[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!file.name.toLowerCase().endsWith('.md')) {
        errors.push(`${file.name}: Markdown(.md) 파일만 업로드 가능합니다.`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: 파일 크기는 5MB 이하여야 합니다.`);
        return;
      }
      valid.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        status: 'pending',
      });
    });

    if (errors.length > 0) setLocalError(errors.join('\n'));
    if (valid.length > 0) {
      setQueue((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...valid.filter((item) => !known.has(item.id))];
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    validateFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    setLocalError(null);
    validateFiles(Array.from(e.dataTransfer.files));
  };

  const updateItem = (id: string, patch: Partial<QueuedFile>) => {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleSubmitFiles = async () => {
    const targets = queue.filter((item) => item.status === 'pending' || item.status === 'failed');
    if (targets.length === 0) {
      setLocalError('업로드할 .md 파일을 추가하세요.');
      return;
    }

    setIsProcessing(true);
    setLocalError(null);
    let successCount = 0;
    for (const item of targets) {
      updateItem(item.id, { status: 'uploading', message: undefined });
      const uploadPromise = uploadDocument({
        source: 'file',
        file: item.file,
        title: queue.length === 1 ? title.trim() || undefined : undefined,
      });
      updateItem(item.id, { status: 'indexing' });
      try {
        const result = await uploadPromise;
        updateItem(item.id, { status: 'done', message: result.message });
        successCount += 1;
        onUploaded?.();
      } catch (err) {
        updateItem(item.id, {
          status: 'failed',
          message: err instanceof Error ? err.message : '업로드 실패',
        });
      }
    }
    setIsProcessing(false);

    if (successCount === targets.length) {
      reset();
      onClose();
    }
  };

  const handleSubmitUrl = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setLocalError('등록할 URL을 입력하세요.');
      return;
    }
    setIsProcessing(true);
    setLocalError(null);
    try {
      await uploadDocument({
        source: 'url',
        url: trimmed,
        title: title.trim() || undefined,
      });
      onUploaded?.();
      reset();
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'URL 등록 실패');
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'file') {
      void handleSubmitFiles();
    } else {
      void handleSubmitUrl();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity" aria-hidden="true" onClick={handleClose} />
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          <div className="bg-white dark:bg-gray-800 px-6 pb-5 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">문서 등록</h3>
              <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 p-1">
                {(['file', 'url'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isProcessing}
                    className={`rounded px-3 py-1.5 text-sm font-medium ${
                      mode === value ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } disabled:opacity-50`}
                    onClick={() => {
                      setMode(value);
                      setLocalError(null);
                    }}
                  >
                    {value === 'file' ? '파일 업로드' : 'URL 등록'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">문서 제목 (선택)</label>
                <input
                  type="text"
                  value={title}
                  disabled={isProcessing}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-50 dark:disabled:bg-gray-600"
                  placeholder={mode === 'file' && queue.length > 1 ? '다중 업로드에서는 파일 제목을 사용합니다' : '비워두면 문서의 첫 제목을 사용합니다'}
                />
              </div>

              {mode === 'file' ? (
                <>
                  <div
                    className="rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-8 text-center hover:border-indigo-300 dark:hover:border-indigo-500"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
                    </svg>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <button
                        type="button"
                        disabled={isProcessing}
                        className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 disabled:opacity-50"
                        onClick={() => inputRef.current?.click()}
                      >
                        .md 파일 선택
                      </button>
                      <span className="ml-1">또는 여러 파일을 드롭</span>
                      <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".md,text/markdown,text/plain"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">파일당 최대 5MB</p>
                  </div>

                  {queue.length > 0 && (
                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {queue.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.file.name}</p>
                              {item.message && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.message}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
                                item.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' :
                                item.status === 'indexing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' :
                                item.status === 'uploading' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {statusLabel[item.status]}
                              </span>
                              {!isProcessing && item.status !== 'done' && (
                                <button
                                  type="button"
                                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                  onClick={() => setQueue((current) => current.filter((q) => q.id !== item.id))}
                                >
                                  제거
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Riido 문서 URL</label>
                  <input
                    type="url"
                    value={url}
                    disabled={isProcessing}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-50 dark:disabled:bg-gray-600"
                    placeholder="https://docs.riido.io/..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">https://docs.riido.io/ 문서만 등록할 수 있습니다.</p>
                </div>
              )}

              {localError && <p className="whitespace-pre-line text-sm text-red-600 dark:text-red-400">{localError}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
            <button
              type="button"
              disabled={isProcessing}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              onClick={handleClose}
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
            >
              {isProcessing ? (mode === 'file' ? '처리 중' : '등록 중') : (mode === 'file' ? '순차 업로드' : 'URL 등록')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
