'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { DailyQueryStat } from '../types';

// TODO: 백엔드에 /admin/stats/daily-queries 엔드포인트 추가 후 실데이터로 교체
function generateMockData(): DailyQueryStat[] {
  const days = ['03/17', '03/18', '03/19', '03/20', '03/21', '03/22', '오늘'];
  return days.map((date) => ({
    date,
    success: Math.floor(Math.random() * 20) + 8,
    failure: Math.floor(Math.random() * 5) + 1,
  }));
}

const MOCK_DATA = generateMockData();

interface Props {
  totalQuestions?: number;
}

export default function DailyQueriesChart({ totalQuestions }: Props) {
  return (
    <div className="bg-white dark:bg-[#1e2235] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2a2f45]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">일별 질문 수 추이</h3>
          {totalQuestions !== undefined && (
            <span className="text-xs text-gray-400">총 {totalQuestions}건</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6d28d9] inline-block" />성공</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />실패</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={MOCK_DATA} barSize={20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: '#f9fafb' }}
          />
          <Bar dataKey="success" name="성공" fill="#6d28d9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="failure" name="실패" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
