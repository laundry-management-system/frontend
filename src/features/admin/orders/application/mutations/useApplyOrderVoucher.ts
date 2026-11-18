import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useApplyOrderVoucher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, voucherCode }: { orderId: number; voucherCode: string | null }) =>
      ordersApi.applyVoucher(orderId, voucherCode),
    // Gồm cả mã VietQR: số tiền QR theo tổng mới
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
