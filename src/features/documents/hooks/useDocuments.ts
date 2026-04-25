import { useState, useEffect } from 'react';
import type { DocumentSummary } from '../types';

const MOCK_DOCUMENTS: DocumentSummary[] = [
  { id: 1, title: '뤼이도 기본 소개.md', category: '시작하기', status: 'indexed' },
  { id: 2, title: '뤼이도 핵심 개념.md', category: '시작하기', status: 'indexed' },
  { id: 3, title: '뤼이도 다운로드.md', category: '시작하기', status: 'indexed' },
  { id: 4, title: '워크스페이스.md', category: '워크스페이스', status: 'indexing' },
  { id: 5, title: '멤버.md', category: '워크스페이스', status: 'indexing' },
  { id: 6, title: '구독 및 결제.md', category: '워크스페이스', status: 'failed' },
  { id: 7, title: '팀.md', category: '팀', status: 'indexed' },
  { id: 8, title: '비공개 팀.md', category: '팀', status: 'indexed' },
  { id: 9, title: '작업 상태.md', category: '작업 관리', status: 'indexed' },
  { id: 10, title: '작업 흐름으로 이해하는 프로젝트 관리.md', category: '작업 관리', status: 'indexed' },
];

export function useDocuments() {
  const [data, setData] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setData(MOCK_DOCUMENTS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const counts = {
    total: data.length,
    indexed: data.filter(d => d.status === 'indexed').length,
    indexing: data.filter(d => d.status === 'indexing').length,
    failed: data.filter(d => d.status === 'failed').length,
  };

  return { data, counts, isLoading };
}
