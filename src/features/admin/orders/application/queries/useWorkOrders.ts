import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { WorkListParams } from '../../domain/types'
import { orderKeys } from '../queryKeys'

export function useWorkOrders(params: WorkListParams) {
  return useQuery({
    queryKey: orderKeys.work(params),
    queryFn: () => ordersApi.listWork(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}
