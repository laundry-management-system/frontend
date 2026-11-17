import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vouchersApi } from '../data/vouchersApi'
import { voucherKeys } from './queryKeys'

/** Voucher đang áp trên đơn; tiền hàng đổi thì tính lại trên dữ liệu này, không gọi lại API. */
export function useVoucherByCode(code: string | null) {
  return useQuery({
    queryKey: voucherKeys.byCode(code ?? ''),
    queryFn: () => vouchersApi.getByCode(code!),
    enabled: !!code,
    retry: false,
  })
}

/** Bấm Áp dụng: luôn lấy mới (voucher có thể vừa bị tắt) và ghi vào cùng cache với `useVoucherByCode`. */
export function useLookupVoucher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) =>
      queryClient.fetchQuery({
        queryKey: voucherKeys.byCode(code),
        queryFn: () => vouchersApi.getByCode(code),
        staleTime: 0,
        retry: false,
      }),
  })
}
