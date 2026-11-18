import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'

/**
 * Tên tiệm + hotline cho hóa đơn. BE chỉ trả qua phiếu nhận (handoff 011 #3); gọi lại không đổi
 * dữ liệu vì BE chỉ ghi giờ in phiếu lần đầu. Khóa nằm ngoài `orderKeys` để thao tác đơn không tải lại.
 */
export function useShopInfo(orderId: number | null) {
  return useQuery({
    queryKey: ['shop-info'],
    queryFn: async () => {
      const { data } = await ordersApi.receipt(orderId!)
      return { shopName: data.shopName, hotline: data.hotline }
    },
    enabled: orderId != null,
    staleTime: Infinity,
  })
}
