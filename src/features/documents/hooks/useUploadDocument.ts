// 문서 업로드 훅. React Hook Form + 업로드 mutation.
export function useUploadDocument() {
  return { upload: async () => {}, isUploading: false };
}
