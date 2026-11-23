import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useUndoDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) =>
      ordersApi.undoDelivery(orderId, reason),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
