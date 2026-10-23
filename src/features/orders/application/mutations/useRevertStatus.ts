import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { OrderStatus } from '../../domain/types'
import { orderKeys } from '../queryKeys'

export function useRevertStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      targetStatus,
      reason,
    }: {
      orderId: number
      targetStatus: OrderStatus
      reason: string
    }) => ordersApi.revertStatus(orderId, targetStatus, reason.trim()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
