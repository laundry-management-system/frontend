import type { StoredOrder } from './types'

const compact = (s: string) => s.replace(/\s+/g, '').toLowerCase()

export function filterStoredOrders<T extends Pick<StoredOrder, 'orderCode' | 'customerPhone'>>(
  rows: T[],
  q: string,
): T[] {
  const needle = compact(q)
  if (!needle) return rows
  return rows.filter(
    (o) => compact(o.orderCode).includes(needle) || compact(o.customerPhone).includes(needle),
  )
}
