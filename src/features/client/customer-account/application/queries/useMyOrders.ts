import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../data/customerPortalApi'
import { customerKeys } from '../queryKeys'
import { useCustomerSessionStore } from '../sessionStore'

export const MY_ORDERS_PAGE_SIZE = 10

/** `page` đếm từ 0. */
export function useMyOrders(page: number) {
  const status = useCustomerSessionStore((s) => s.status)
  return useQuery({
    queryKey: customerKeys.orders(page),
    queryFn: () => customerPortalApi.listOrders({ page, size: MY_ORDERS_PAGE_SIZE }),
    enabled: status === 'authenticated',
    placeholderData: keepPreviousData,
  })
}
