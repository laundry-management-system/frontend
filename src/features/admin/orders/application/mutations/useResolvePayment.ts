import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { PaymentResolution } from '../../domain/types'
import { orderKeys } from '../queryKeys'

interface ResolveVars {
  orderCode: string
  paymentId: number
  resolution: PaymentResolution
  reason: string
}

export function useResolvePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderCode, paymentId, resolution, reason }: ResolveVars) =>
      ordersApi.resolvePayment(orderCode, paymentId, resolution, reason.trim()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
