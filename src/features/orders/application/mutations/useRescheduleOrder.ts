import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useRescheduleOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, dueAt, reason }: { orderId: number; dueAt: Date; reason: string }) =>
      ordersApi.reschedule(orderId, dueAt.toISOString(), reason.trim()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
