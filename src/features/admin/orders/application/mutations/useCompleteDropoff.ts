import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useCompleteDropoff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      pickupTrackingCode,
      dueAt,
    }: {
      orderId: number
      pickupTrackingCode?: string
      dueAt?: string | null
    }) => ordersApi.completeDropoff(orderId, pickupTrackingCode?.trim() || undefined, dueAt),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
