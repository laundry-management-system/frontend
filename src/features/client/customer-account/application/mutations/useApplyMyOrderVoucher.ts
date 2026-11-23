import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { customerPortalApi } from '../../data/customerPortalApi'
import { customerKeys } from '../queryKeys'
import { customerOrderDetailSchema } from '../schemas'

/** Lỗi 400 hiện inline dưới ô nhập (caller đọc error); 429 báo toast. Đổi voucher dùng lại PUT này. */
export function useApplyMyOrderVoucher(orderCode: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (voucherCode: string) =>
      customerOrderDetailSchema.parse(
        await customerPortalApi.applyMyOrderVoucher(orderCode, voucherCode.trim().toUpperCase()),
      ),
    onSuccess: (order) => {
      queryClient.setQueryData(customerKeys.order(orderCode), order)
      void queryClient.invalidateQueries({ queryKey: customerKeys.paymentQr(orderCode) })
      void queryClient.invalidateQueries({ queryKey: [...customerKeys.all, 'orders'] })
    },
    onError: (e) => {
      if (toApiError(e).status === 429) notify.error('Bạn thử quá nhiều lần, vui lòng thử lại sau')
    },
  })
}
