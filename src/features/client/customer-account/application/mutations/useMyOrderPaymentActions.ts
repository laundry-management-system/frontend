import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { customerPortalApi } from '../../data/customerPortalApi'
import { customerKeys } from '../queryKeys'
import { customerOrderDetailSchema } from '../schemas'

function useOrderAction(orderCode: string, call: (code: string) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => customerOrderDetailSchema.parse(await call(orderCode)),
    onSuccess: (order) => {
      queryClient.setQueryData(customerKeys.order(orderCode), order)
      void queryClient.invalidateQueries({ queryKey: customerKeys.paymentQr(orderCode) })
      void queryClient.invalidateQueries({ queryKey: [...customerKeys.all, 'orders'] })
    },
    onError: (e) => notify.error(toApiError(e).message),
  })
}

/** Gỡ voucher khách tự áp (FR-044). */
export const useRemoveMyOrderVoucher = (orderCode: string) =>
  useOrderAction(orderCode, customerPortalApi.removeMyOrderVoucher)

/** Khách báo đã chuyển khoản: chỉ là báo, đơn vẫn chưa thanh toán (FR-047). */
export const useClaimMyOrderPayment = (orderCode: string) =>
  useOrderAction(orderCode, customerPortalApi.claimMyOrderPayment)

/** Khách xác nhận đã nhận đơn giao tận nơi (FR-057). */
export const useConfirmMyOrderReceived = (orderCode: string) =>
  useOrderAction(orderCode, customerPortalApi.confirmReceived)
