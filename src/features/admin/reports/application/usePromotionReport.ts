import { useQuery } from '@tanstack/react-query'
import type { OrderChannel } from '@/features/admin/orders'
import { reportsApi } from '../data/reportsApi'
import type { DateRange } from '../domain/types'
import { reportKeys } from './queryKeys'

export function usePromotionReport(range: DateRange, enabled: boolean, channel?: OrderChannel) {
  return useQuery({
    queryKey: reportKeys.promotions(range, channel),
    queryFn: () => reportsApi.promotions(range, channel),
    enabled,
    placeholderData: (prev) => prev,
  })
}
