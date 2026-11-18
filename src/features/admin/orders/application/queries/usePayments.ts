import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function usePayments(orderCode: string | undefined) {
  return useQuery({
    queryKey: orderKeys.payments(orderCode ?? ''),
    queryFn: () => ordersApi.payments(orderCode!),
    enabled: !!orderCode,
  })
}
