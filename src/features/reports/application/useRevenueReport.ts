import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useRevenueReport(period: ReportPeriod, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.revenue(period),
    queryFn: () => reportsApi.revenue(period, period.mode),
    enabled,
    placeholderData: (prev) => prev,
  })
}
