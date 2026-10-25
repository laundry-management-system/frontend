import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

/** Chỉ gọi khi đang ở tab chuyển khoản; lỗi cấu hình là lỗi nghiệp vụ nên không thử lại. */
export function useVietQr(orderCode: string, enabled: boolean) {
  return useQuery({
    queryKey: orderKeys.vietQr(orderCode),
    queryFn: () => ordersApi.vietQr(orderCode),
    enabled,
    staleTime: 0,
    retry: false,
  })
}
