'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStatsOverview, getTopQueries, getSatisfactionStats } from '../api';
import type { StatsOverview, TopQuery, SatisfactionStats, StatsPeriod } from '../types';
import { Stats } from 'fs';

export function useStatsOverview(period: StatsPeriod = '7d') {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await getStatsOverview(period));
    } catch {
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useTopQueries(period: StatsPeriod = '7d') {
  const [data, setData] = useState<TopQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopQueries(5,period)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [period]);

  return { data, loading };
}

export function useSatisfactionStats(period: StatsPeriod) {
  const [data, setData] = useState<SatisfactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSatisfactionStats(period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  return { data, loading };
}
