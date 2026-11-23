import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { CancelReasonCode } from '../../domain/cancelReasons'
import { orderKeys } from '../queryKeys'

export function useRejectOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      reasonCode,
      customerReason,
      reason,
    }: {
      orderId: number
      reasonCode: CancelReasonCode
      customerReason: string
      reason?: string
    }) =>
      ordersApi.reject(orderId, {
        reasonCode,
        customerReason: customerReason.trim(),
        reason: reasonCode === 'OTHER' ? reason?.trim() || undefined : undefined,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
