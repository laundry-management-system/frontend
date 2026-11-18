import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) =>
      ordersApi.cancel(orderId, reason.trim()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
