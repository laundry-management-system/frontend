import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useAdjustPrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      newTotalAmount,
      reason,
    }: {
      orderId: number
      newTotalAmount: number
      reason: string
    }) => ordersApi.adjustPrice(orderId, newTotalAmount, reason.trim()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
