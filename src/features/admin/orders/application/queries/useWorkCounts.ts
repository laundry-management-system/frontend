import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { WorkListParams } from '../../domain/types'
import { orderKeys } from '../queryKeys'

export function useWorkCounts(
  params: Pick<WorkListParams, 'q' | 'dueFrom' | 'dueTo'>,
  refetchInterval?: number,
) {
  return useQuery({
    queryKey: orderKeys.workCounts(params),
    queryFn: () => ordersApi.workCounts(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchInterval,
  })
}
