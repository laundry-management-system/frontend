import { useQuery } from '@tanstack/react-query'
import { DEFAULT_PAGE_SIZE } from '@/shared/admin/config/constants'
import { ordersApi } from '../../data/ordersApi'
import type { OrderChannel, OrderStatus } from '../../domain/types'
import { orderKeys } from '../queryKeys'

/** `page` bắt đầu từ 0. */
export function useOrders({
  status,
  channel,
  q,
  page,
}: {
  status?: OrderStatus
  channel?: OrderChannel
  q: string
  page: number
}) {
  const params = { status, channel, q: q.trim(), page, size: DEFAULT_PAGE_SIZE }
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: (prev) => prev,
  })
}
