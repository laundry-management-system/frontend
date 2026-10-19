import { useQuery } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/apiError'
import { customersApi } from '../data/customersApi'
import { customerKeys } from './queryKeys'

export function useCustomer(id: number) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.get(id),
    enabled: Number.isFinite(id),
    retry: (count, error) => toApiError(error).status !== 404 && count < 2,
  })
}
