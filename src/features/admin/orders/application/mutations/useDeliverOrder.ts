import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import type { OrderDetail } from '../../domain/types'
import { orderKeys } from '../queryKeys'

/** Trả đồ cho đơn đã thanh toán (không thu tiền): nhân viên hoàn tất thay khách. */
export function useDeliverOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (order: Pick<OrderDetail, 'orderCode'>) => ordersApi.deliver(order.orderCode, {}),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
