import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../data/customersApi'
import type { CustomerStats } from '../domain/types'
import { customerKeys } from './queryKeys'

export const CUSTOMER_ORDERS_PAGE_SIZE = 10

export function useCustomerOrders(phone: string | undefined, page: number) {
  return useQuery({
    queryKey: customerKeys.orders(phone ?? '', page),
    queryFn: () =>
      customersApi.listOrdersByPhone({
        phone: phone!,
        page,
        size: CUSTOMER_ORDERS_PAGE_SIZE,
      }),
    enabled: !!phone,
    placeholderData: (prev) => prev,
  })
}

export function useCustomerStats(phone: string | undefined) {
  const query = useQuery({
    queryKey: customerKeys.firstOrder(phone ?? ''),
    queryFn: () => customersApi.listOrdersByPhone({ phone: phone!, page: 0, size: 1 }),
    enabled: !!phone,
  })
  const stats: CustomerStats | undefined = query.data && {
    orderCount: query.data.page.totalElements,
    lastOrderAt: query.data.content[0]?.receivedAt ?? null,
    totalSpent: null,
    topService: null,
  }
  return { ...query, stats }
}
