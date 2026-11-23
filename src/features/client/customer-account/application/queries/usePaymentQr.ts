import { useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../data/customerPortalApi'
import { customerKeys } from '../queryKeys'
import { paymentQrSchema } from '../schemas'

/** Chỉ gọi khi modal mở; gcTime 0 + không retry để mỗi lần mở lấy số tiền mới và lỗi hiện ngay. */
export function usePaymentQr(orderCode: string, open: boolean) {
  return useQuery({
    queryKey: customerKeys.paymentQr(orderCode),
    queryFn: async () => paymentQrSchema.parse(await customerPortalApi.getPaymentQr(orderCode)),
    enabled: open,
    gcTime: 0,
    retry: false,
  })
}
