import { useQuery } from '@tanstack/react-query'
import type { OrderChannel } from '@/features/admin/orders'
import { reportsApi } from '../data/reportsApi'
import type { DateRange } from '../domain/types'
import { reportKeys } from './queryKeys'

export function useRevenuePayments(range: DateRange, channel?: OrderChannel) {
  return useQuery({
    queryKey: reportKeys.revenuePayments(range, channel),
    queryFn: () => reportsApi.revenuePayments(range, channel),
  })
}
