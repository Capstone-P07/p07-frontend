import React from 'react';
import type { DocumentSummary } from '../types';

interface DocumentRowProps {
  document: DocumentSummary;
  index: number;
  onClick: () => void;
}

export default function DocumentRow({ document, index, onClick }: DocumentRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INDEXED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ INDEXED</span>;
      case 'INDEXING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">🔄 INDEXING</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ FAILED</span>;
      default:
        return null;
    }
  };

  return (
    <tr className="hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0" onClick={onClick}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {String(index + 1).padStart(2, '0')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">{document.title}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border border-gray-300 text-gray-600 bg-gray-50">
          {document.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(document.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-500 p-2" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
