'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStatsOverview, getTopQueries, getSatisfactionStats } from '../api';
import type { StatsOverview, TopQuery, SatisfactionStats, StatsPeriod } from '../types';

export function useStatsOverview() {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await getStatsOverview());
    } catch {
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useTopQueries() {
  const [data, setData] = useState<TopQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopQueries(5)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useSatisfactionStats(_period: StatsPeriod) {
  const [data, setData] = useState<SatisfactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSatisfactionStats()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [_period]);

  return { data, loading };
}
