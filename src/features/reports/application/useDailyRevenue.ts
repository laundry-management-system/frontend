import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import { last14Days } from '../domain/dashboard'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

/** Doanh thu từng ngày của 14 ngày gần nhất (tính cả `today`). */
export function useDailyRevenue(today: string) {
  const period: ReportPeriod = { ...last14Days(today), mode: 'day' }
  return useQuery({
    queryKey: reportKeys.revenue(period),
    queryFn: () => reportsApi.revenue(period, 'day'),
    select: (r) => r.rows,
  })
}
