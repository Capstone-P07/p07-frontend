export type DocumentStatus = "INDEXED" | "INDEXING" | "FAILED";

export type DocumentCategory = "시작하기" | "워크스페이스" | "팀" | "작업 관리";

export interface DocumentSummary {
  id: string;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  sourceUrl?: string;
}

export interface DocumentDetail extends DocumentSummary {
  markdown: string;
}
