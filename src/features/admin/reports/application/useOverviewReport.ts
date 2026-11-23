import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../data/reportsApi'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useOverviewReport(period: ReportPeriod, enabled = true, channel?: string) {
  return useQuery({
    queryKey: reportKeys.overview(period, channel),
    queryFn: () => reportsApi.overview(period),
    enabled,
    placeholderData: (prev) => prev,
  })
}
