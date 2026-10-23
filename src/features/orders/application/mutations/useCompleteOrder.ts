import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useCompleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, shelfLocation }: { orderId: number; shelfLocation: string }) =>
      ordersApi.complete(orderId, shelfLocation.trim()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
