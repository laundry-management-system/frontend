import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useOperationsReport(period: ReportPeriod, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.operations(period),
    queryFn: () => reportsApi.operations(period, period.mode),
    enabled,
    placeholderData: (prev) => prev,
  })
}
