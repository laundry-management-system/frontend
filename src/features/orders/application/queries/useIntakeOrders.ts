import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

/** Các đơn cùng lượt nhận (tối đa 2), đơn tiêu chuẩn trước. */
export function useIntakeOrders(intakeCode: string | null | undefined) {
  const params = { intakeCode: intakeCode ?? undefined, q: '', page: 0, size: 2 }
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () =>
      (await ordersApi.list(params)).content.sort(
        (a, b) => Number(a.orderType === 'EXPRESS') - Number(b.orderType === 'EXPRESS'),
      ),
    enabled: !!intakeCode,
  })
}
