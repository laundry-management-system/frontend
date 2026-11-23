import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useCompleteDropoff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      pickupTrackingCode,
    }: {
      orderId: number
      pickupTrackingCode?: string
    }) => ordersApi.completeDropoff(orderId, pickupTrackingCode?.trim() || undefined),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
