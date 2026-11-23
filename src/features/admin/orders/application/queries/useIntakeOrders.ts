import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { orderKeys } from '../queryKeys'

export function useIntakeOrders(intakeCode: string | null | undefined) {
  const params = { intakeCode: intakeCode ?? undefined, q: '', page: 0, size: 2 }
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => (await ordersApi.list(params)).content,
    enabled: !!intakeCode,
  })
}
