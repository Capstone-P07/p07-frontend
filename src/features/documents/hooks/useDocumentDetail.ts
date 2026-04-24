// 단일 문서 조회/수정 훅.
export function useDocumentDetail(id: string | null) {
  return { data: null, isLoading: false, id };
}
