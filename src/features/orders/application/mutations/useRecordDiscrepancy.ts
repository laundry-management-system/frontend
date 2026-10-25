import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useRecordDiscrepancy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderCode,
      receivedAmount,
      note,
    }: {
      orderCode: string
      receivedAmount: number
      note: string
    }) => ordersApi.recordDiscrepancy(orderCode, { receivedAmount, note: note.trim() }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
