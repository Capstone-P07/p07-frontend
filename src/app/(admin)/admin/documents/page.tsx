'use client';

import React, { useState } from 'react';
import DocumentPageHeader from '@/features/documents/components/DocumentPageHeader';
import StatusStrip from '@/features/documents/components/StatusStrip';
import DocumentTable from '@/features/documents/components/DocumentTable';
import DocumentUploadModal from '@/features/documents/components/DocumentUploadModal';
import DocumentDetailPanel from '@/features/documents/components/DocumentDetailPanel';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { useDocumentDetail } from '@/features/documents/hooks/useDocumentDetail';
import type { DocumentSummary } from '@/features/documents/types';

export default function DocumentsPage() {
  const { data: documents, counts, isLoading, refetch: refetchDocuments } = useDocuments();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const { data: documentDetail, refetch: refetchDetail } = useDocumentDetail(selectedDocumentId);

  const handleListMutated = () => {
    void refetchDocuments();
    if (selectedDocumentId != null) {
      void refetchDetail();
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleFilterClick = () => {
    alert('필터 기능은 아직 구현되지 않았습니다.');
  };

  const handleRowClick = (doc: DocumentSummary) => {
    setSelectedDocumentId(doc.id);
  };

  const handleCloseDetailPanel = () => {
    setSelectedDocumentId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <DocumentPageHeader 
          totalCount={counts.total} 
          onUploadClick={handleUploadClick} 
          onFilterClick={handleFilterClick} 
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <StatusStrip counts={counts} />
            <DocumentTable 
              documents={documents} 
              onUploadClick={handleUploadClick} 
              onRowClick={handleRowClick} 
            />
          </>
        )}

        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          onUploaded={handleListMutated}
        />

        {selectedDocumentId != null && documentDetail && (
          <DocumentDetailPanel
            key={documentDetail.id}
            document={documentDetail}
            isOpen={true}
            onClose={handleCloseDetailPanel}
            onMutated={handleListMutated}
          />
        )}
      </div>
    </div>
  );
}
