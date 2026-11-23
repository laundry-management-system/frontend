import { useQuery } from '@tanstack/react-query'
import type { OrderChannel } from '@/features/admin/orders'
import { reportsApi } from '../data/reportsApi'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useRevenueReport(period: ReportPeriod, enabled: boolean, channel?: OrderChannel) {
  return useQuery({
    queryKey: reportKeys.revenue(period, channel),
    queryFn: () => reportsApi.revenue(period, period.mode, channel),
    enabled,
    placeholderData: (prev) => prev,
  })
}
