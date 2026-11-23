import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useRejectOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      customerReason,
      reason,
    }: {
      orderId: number
      customerReason: string
      reason?: string
    }) =>
      ordersApi.reject(orderId, {
        customerReason: customerReason.trim(),
        reason: reason?.trim() || undefined,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
