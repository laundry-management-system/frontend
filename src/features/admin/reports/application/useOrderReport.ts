import { useQuery } from '@tanstack/react-query'
import type { OrderChannel } from '@/features/admin/orders'
import { reportsApi } from '../data/reportsApi'
import type { ReportPeriod } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useOrderReport(period: ReportPeriod, enabled: boolean, channel?: OrderChannel) {
  return useQuery({
    queryKey: reportKeys.orders(period, channel),
    queryFn: () => reportsApi.orders(period, period.mode, channel),
    enabled,
    placeholderData: (prev) => prev,
  })
}
