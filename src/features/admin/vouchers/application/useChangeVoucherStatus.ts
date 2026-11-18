import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vouchersApi } from '../data/vouchersApi'
import type { VoucherStatus } from '../domain/types'
import { voucherKeys } from './queryKeys'

export function useChangeVoucherStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: VoucherStatus }) =>
      vouchersApi.changeStatus(id, status),
    // Cả khi lỗi: voucher có thể đã bị Admin khác đổi trạng thái
    onSettled: () => queryClient.invalidateQueries({ queryKey: voucherKeys.all }),
  })
}
