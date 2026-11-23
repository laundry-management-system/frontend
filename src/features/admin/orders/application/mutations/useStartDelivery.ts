import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useStartDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      deliveryTrackingCode,
    }: {
      orderId: number
      deliveryTrackingCode?: string
    }) => ordersApi.startDelivery(orderId, deliveryTrackingCode?.trim() || undefined),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
