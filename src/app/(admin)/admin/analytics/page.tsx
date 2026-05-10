'use client';

import { useState } from 'react';
import PeriodTabs from '@/features/stats/components/PeriodTabs';
import StatCard from '@/features/stats/components/StatCard';
import DailyQueriesChart from '@/features/stats/components/DailyQueriesChart';
import SatisfactionChart from '@/features/stats/components/SatisfactionChart';
import TopQueriesList from '@/features/stats/components/TopQueriesList';
import CategoryChart from '@/features/stats/components/CategoryChart';
import { useStatsOverview, useTopQueries, useSatisfactionStats } from '@/features/stats/hooks/useStats';
import type { StatsPeriod } from '@/features/stats/types';

// ── 아이콘 ────────────────────────────────────────────────
function IconMessage() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconThumb() {
  return (
    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
// ─────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<StatsPeriod>('7d');

  const { data: overview, loading: ovLoading } = useStatsOverview();
  const { data: topQueries, loading: tqLoading } = useTopQueries();
  const { data: satisfaction } = useSatisfactionStats(period);

  // 파생 수치 계산
  const totalQ    = overview?.totalQuestions ?? 0;
  const unanswered = overview?.totalUnanswered ?? 0;
  const successRate = totalQ > 0 ? Math.round(((totalQ - unanswered) / totalQ) * 1000) / 10 : 0;
  const failRate    = totalQ > 0 ? Math.round((unanswered / totalQ) * 1000) / 10 : 0;
  const satisfaction_rate = overview?.satisfactionRate ?? 0;
  const satisfactionInt   = Math.floor(satisfaction_rate);
  const satisfactionDec   = (satisfaction_rate % 1).toFixed(1).slice(1); // ".x"

  // 날짜 범위 표시
  const today = new Date();
  const from  = new Date(today);
  from.setDate(today.getDate() - (period === '7d' ? 7 : period === '30d' ? 30 : 0));
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">통계</h1>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 border border-gray-200 dark:border-[#2a2f45] rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {period !== 'today' && period !== 'all'
              ? `${fmt(from)} ~ ${fmt(today)}`
              : period === 'today' ? fmt(today) : '전체 기간'
            }
          </div>

          {/* 알림 버튼 */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#1e2235] transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* 알림 뱃지 */}
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* 유저 아바타 */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 flex items-center justify-center shrink-0 cursor-pointer">
            <span className="text-xs font-bold text-white">A</span>
          </div>
        </div>
      </div>

      {/* ── 4개 스탯 카드 ── */}
      {ovLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-[#1e2235] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="총 질문 수"
            value={totalQ}
            icon={<IconMessage />}
          />
          <StatCard
            label="답변 성공률"
            value={Math.floor(successRate)}
            subValue={`.${String(successRate).split('.')[1] ?? '0'}`}
            unit="%"
            icon={<IconCheck />}
          />
          <StatCard
            label="사용자 만족도"
            value={satisfactionInt}
            subValue={satisfactionDec}
            unit="%"
            icon={<IconThumb />}
          />
          <StatCard
            label="실패율"
            value={Math.floor(failRate)}
            subValue={`.${String(failRate).split('.')[1] ?? '0'}`}
            unit="%"
            icon={<IconAlert />}
            accent="red"
          />
        </div>
      )}

      {/* ── 차트 2개 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyQueriesChart totalQuestions={totalQ} />
        <SatisfactionChart
          data={satisfaction?.daily ?? []}
          changePercent={12.4}
        />
      </div>

      {/* ── FAQ + 카테고리 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopQueriesList data={topQueries} loading={tqLoading} />
        <CategoryChart totalQueries={overview?.totalIndexedDocs ?? 14} />
      </div>

      {/* ── 하단 인사이트 카드 3개 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 인공지능 통찰 */}
        <div className="bg-white dark:bg-[#1e2235] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2a2f45]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">인공지능 통찰</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            지난 7일간 &apos;Jira 연동&apos; 관련 질문이 15% 증가했습니다. 기술 문서의 연동 섹션을 보강하면 답변 성공률을 5% 이상 개선할 수 있을 것으로 예측합니다.
          </p>
          <button className="text-xs text-purple-500 hover:text-purple-600 font-medium">
            개선 제안 상세 보기 →
          </button>
        </div>

        {/* 사용자 활동성 */}
        <div className="bg-white dark:bg-[#1e2235] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2a2f45]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">사용자 활동성</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            사용자들은 주로 월요일 오전 10시와 수요일 오후 3시에 가장 많은 질문을 생성하고 있습니다. 해당 시간대에 응답 서버 자원을 추가 할당할 것을 권장합니다.
          </p>
        </div>

        {/* Human-Free Interaction 지표 */}
        <div className="bg-white dark:bg-[#1e2235] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2a2f45] flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black text-gray-900 dark:text-white leading-none">
            {overview?.satisfactionRate != null
              ? `${Math.round(overview.satisfactionRate)}%`
              : '—'}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">
            Human-Free Interaction
          </span>
          <span className="text-xs text-gray-400 mt-1">자동 처리된 질문 비율</span>
        </div>
      </div>
    </div>
  );
}
