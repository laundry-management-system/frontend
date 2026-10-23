import { useQuery } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/apiError'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useOrder(id: number | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? 0),
    queryFn: () => ordersApi.get(id!),
    enabled: id != null && Number.isFinite(id),
    retry: (count, error) => toApiError(error).status !== 404 && count < 2,
  })
}
