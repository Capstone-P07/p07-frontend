import api from '@/lib/api';
import type { StatsOverview, TopQuery, SatisfactionStats } from './types';

interface Envelope<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

export async function getStatsOverview(): Promise<StatsOverview> {
  const res = await api.get<Envelope<StatsOverview>>('/admin/stats/overview');
  return res.data.data;
}

export async function getTopQueries(limit = 5): Promise<TopQuery[]> {
  const res = await api.get<Envelope<TopQuery[]>>(`/admin/stats/top-queries?limit=${limit}`);
  return res.data.data;
}

export async function getSatisfactionStats(): Promise<SatisfactionStats> {
  const res = await api.get<Envelope<SatisfactionStats>>('/admin/stats/satisfaction');
  return res.data.data;
}
