import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      customerReason,
    }: {
      orderId: number
      reason: string
      customerReason?: string
    }) =>
      ordersApi.cancel(orderId, {
        reason: reason.trim() || undefined,
        customerReason: customerReason?.trim() || undefined,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
