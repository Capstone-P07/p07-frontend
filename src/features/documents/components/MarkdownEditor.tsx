import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  initialContent: string;
}

export default function MarkdownEditor({ initialContent }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('edit')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'edit'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            편집 (Raw Markdown)
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            미리보기 (Markdown)
          </button>
        </nav>
      </div>
      
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-b-md p-4 overflow-y-auto mt-4">
        {activeTab === 'edit' ? (
          <textarea
            className="w-full h-full min-h-[500px] p-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm text-gray-800 bg-white"
            value={initialContent}
            readOnly
          />
        ) : (
          <div className="prose prose-sm max-w-none prose-indigo bg-white p-6 border border-gray-200 rounded-md shadow-sm min-h-[500px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {initialContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
