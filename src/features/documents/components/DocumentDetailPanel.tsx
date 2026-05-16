import React from 'react';
import type { DocumentDetail } from '../types';
import MarkdownEditor from './MarkdownEditor';
import {
  useDeleteDocument,
  useReindexDocument,
} from '../hooks/useDocumentMutations';

interface DocumentDetailPanelProps {
  document: DocumentDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onMutated?: () => void; // 삭제/재색인 성공 시 부모(useDocuments.refetch)
}

export default function DocumentDetailPanel({ document, isOpen, onClose, onMutated }: DocumentDetailPanelProps) {
  const del = useDeleteDocument();
  const reidx = useReindexDocument();

  if (!isOpen || !document) return null;

  const handleDelete = async () => {
    if (!window.confirm(`"${document.title}" 문서를 삭제하시겠습니까? 관련 청크와 색인이 함께 삭제됩니다.`)) {
      return;
    }
    try {
      await del.mutate(document.id);
      onMutated?.();
      onClose();
    } catch {
      // hook 에러 표시
    }
  };

  const handleReindex = async () => {
    try {
      await reidx.mutate(document.id);
      onMutated?.();
    } catch {
      // hook 에러 표시
    }
  };

  const busy = del.isPending || reidx.isPending;
  const mutationError = del.error ?? reidx.error;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      <section className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-2xl">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900" id="slide-over-title">
                  문서 상세
                </h2>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {document.title}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex space-x-8 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    document.status === 'indexed' ? 'bg-green-100 text-green-800' :
                    document.status === 'indexing' ? 'bg-blue-100 text-blue-800' :
                    document.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {document.status === 'indexed' ? '✅ 인덱싱 완료' : document.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border border-gray-300 bg-gray-50 text-gray-600">
                      {document.category}
                    </span>
                  </div>
                </div>
              </div>

              {document.sourceUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Document URL</h3>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      readOnly
                      className="flex-1 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 bg-gray-50 text-gray-500"
                      value={document.sourceUrl}
                    />
                  </div>
                </div>
              )}

              {document.markdown && (
                <div className="h-[600px]">
                  <MarkdownEditor initialContent={document.markdown} />
                </div>
              )}

              {mutationError && (
                <p className="mt-4 text-sm text-red-600">{mutationError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                type="button"
                disabled={busy}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                onClick={handleDelete}
              >
                {del.isPending ? '삭제 중…' : '삭제'}
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  disabled={busy}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  onClick={onClose}
                >
                  닫기
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  onClick={handleReindex}
                >
                  {reidx.isPending ? '재색인 중…' : '재색인'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
