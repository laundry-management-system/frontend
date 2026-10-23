import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useStartProcessing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: number) => ordersApi.startProcessing(orderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
