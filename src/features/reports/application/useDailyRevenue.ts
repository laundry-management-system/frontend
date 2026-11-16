import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import { last14Days } from '../domain/dashboard'
import { reportKeys } from './queryKeys'

/** Doanh thu từng ngày của 14 ngày gần nhất (tính cả `today`). */
export function useDailyRevenue(today: string) {
  const range = last14Days(today)
  return useQuery({
    queryKey: reportKeys.dailyRevenue(range),
    queryFn: () => reportsApi.dailyRevenue(range),
  })
}
