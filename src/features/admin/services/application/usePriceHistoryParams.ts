import { useSearchParams } from 'react-router-dom'
import { DEFAULT_PAGE_SIZE } from '@/shared/admin/config/constants'
import { PRICE_FIELDS, type PriceField, type PriceHistoryFilter } from '../domain/types'

const DATE = /^\d{4}-\d{2}-\d{2}$/
const ID = /^\d+$/
const FILTER_KEYS = ['serviceId', 'userId', 'field', 'from', 'to'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

const pad = (n: number) => String(n).padStart(2, '0')
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Mặc định từ đầu năm đến hôm nay, như mẫu bảng lịch sử giá */
export const defaultPriceHistoryRange = (now = new Date()) => ({
  from: `${now.getFullYear()}-01-01`,
  to: isoDate(now),
})

/**
 * Bộ lọc lịch sử giá trên URL (`?serviceId=&userId=&field=&from=&to=&page=`).
 * Không dùng useListParams vì màn có 4 bộ lọc thay vì q/status; đổi bộ lọc thì về trang 1.
 */
export function usePriceHistoryParams() {
  const [params, setParams] = useSearchParams()
  const get = (k: string) => params.get(k) ?? ''
  const range = defaultPriceHistoryRange()
  const rawPage = Number(params.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 1 ? rawPage : 1

  const filter: PriceHistoryFilter = {
    serviceId: ID.test(get('serviceId')) ? Number(get('serviceId')) : undefined,
    userId: ID.test(get('userId')) ? Number(get('userId')) : undefined,
    field: PRICE_FIELDS.includes(get('field') as PriceField)
      ? (get('field') as PriceField)
      : undefined,
    from: DATE.test(get('from')) ? get('from') : range.from,
    to: DATE.test(get('to')) ? get('to') : range.to,
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  }

  const update = (patch: Partial<Record<FilterKey | 'page', string | undefined>>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(patch)) {
          if (v) next.set(k, v)
          else next.delete(k)
        }
        return next
      },
      { replace: true },
    )
  const setFilter = (patch: Partial<Record<FilterKey, string | undefined>>) =>
    update({ ...patch, page: undefined })

  return {
    filter,
    page,
    filtered: FILTER_KEYS.some((k) => params.has(k)),
    setFilter,
    setPage: (p: number) => update({ page: p > 1 ? String(p) : undefined }),
    reset: () => setParams({}, { replace: true }),
  }
}

export type PriceHistoryParams = ReturnType<typeof usePriceHistoryParams>
