import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useOrderReport(period: ReportPeriod, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.orders(period),
    queryFn: () => reportsApi.orders(period, period.mode),
    enabled,
    placeholderData: (prev) => prev,
  })
}
