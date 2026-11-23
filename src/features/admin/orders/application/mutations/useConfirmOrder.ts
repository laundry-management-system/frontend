import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useConfirmOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: number) => ordersApi.confirm(orderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
