import { useState, useEffect } from 'react';
import type { DocumentDetail } from '../types';

const MOCK_MARKDOWN = `# 핵심 개념

## 기본 개념

### 워크스페이스
뤼이도는 하나의 워크스페이스 안에서 모든 것이 이루어집니다.
같은 워크스페이스 안에 존재하는 모든 것들은 서로 유기적으로 연결되어 있습니다.

> 1 워크스페이스 = 1 기업

### 팀
하나의 워크스페이스에서는 여러 개의 팀을 만들고 관리할 수 있습니다.
팀은 주로 함께 일하는 사람들로 구성되어 있으며, 실질적으로 작업이 이루어지는 공간입니다.

\`\`\`javascript
// 예시 코드
function helloWorkspace() {
  console.log("Welcome to the workspace!");
}
\`\`\`
`;

export function useDocumentDetail(id: number | null) {
  const [data, setData] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id == null) {
      setData(null);
      return;
    }

    setIsLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      setData({
        id,
        title: '뤼이도 핵심 개념.md',
        category: '시작하기',
        status: 'indexed',
        sourceUrl: 'https://docs.example.com/guide',
        markdown: MOCK_MARKDOWN
      });
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  return { data, isLoading };
}
