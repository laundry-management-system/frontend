import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { ORDER_STATUSES, type OrderStatus } from '../../domain/types'
import { orderKeys } from '../queryKeys'

export function useOrderCounts() {
  return useQuery({
    queryKey: orderKeys.counts(),
    queryFn: async () => {
      const [all, ...byStatus] = await Promise.all([
        ordersApi.count(),
        ...ORDER_STATUSES.map((s) => ordersApi.count(s)),
      ])
      const counts = { ALL: all } as Record<OrderStatus | 'ALL', number>
      ORDER_STATUSES.forEach((s, i) => (counts[s] = byStatus[i]))
      return counts
    },
    staleTime: 30_000,
  })
}
