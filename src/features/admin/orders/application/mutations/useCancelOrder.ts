import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { CancelReasonCode } from '../../domain/cancelReasons'
import { orderKeys } from '../queryKeys'

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      reasonCode,
      reason,
      customerReason,
    }: {
      orderId: number
      reasonCode: CancelReasonCode
      reason: string
      customerReason?: string
    }) =>
      ordersApi.cancel(orderId, {
        reasonCode,
        reason: reasonCode === 'OTHER' ? reason.trim() || undefined : undefined,
        customerReason: customerReason?.trim() || undefined,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
