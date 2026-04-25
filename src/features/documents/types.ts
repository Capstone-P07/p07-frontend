// BE의 document.status CHECK 제약과 동일: pending | indexing | indexed | failed
export type DocumentStatus = "pending" | "indexing" | "indexed" | "failed";

export type DocumentCategory = "시작하기" | "워크스페이스" | "팀" | "작업 관리";

export interface DocumentSummary {
  id: number;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  sourceUrl?: string;
}

export interface DocumentDetail extends DocumentSummary {
  markdown: string;
}
