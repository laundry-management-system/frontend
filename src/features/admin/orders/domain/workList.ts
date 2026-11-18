import { isUnclassified } from './rules.ts'
import type { OrderListItem, OrderStatus, OrderType, WorkTab } from './types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export interface WorkFilter {
  statuses: OrderStatus[]
  classified?: boolean
  late?: boolean
  orderType?: OrderType
}

const OPEN: OrderStatus[] = ['RECEIVED', 'PROCESSING']

/** Tab → tham số lọc của `GET /orders`. Tab Mới nhận gồm cả đơn chưa phân loại. */
export function tabParams(tab: WorkTab): WorkFilter {
  switch (tab) {
    case 'UNCLASSIFIED':
      return { statuses: ['RECEIVED'], classified: false }
    case 'RECEIVED':
      return { statuses: ['RECEIVED'] }
    case 'PROCESSING':
      return { statuses: ['PROCESSING'] }
    case 'LATE':
      return { statuses: OPEN, late: true }
    case 'EXPRESS':
      return { statuses: OPEN, orderType: 'EXPRESS' }
    default:
      return { statuses: OPEN }
  }
}

const addDays = (isoDate: string, n: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Bộ chọn Hẹn trả → `{ dueFrom, dueTo }`; `today` dạng yyyy-MM-dd. Giá trị lạ → không lọc. */
export function dueRange(due: string, today: string): { dueFrom?: string; dueTo?: string } {
  const day =
    due === 'today'
      ? today
      : due === 'tomorrow'
        ? addDays(today, 1)
        : ISO_DATE.test(due)
          ? due
          : null
  return day ? { dueFrom: day, dueTo: day } : {}
}

export const isLate = (o: Pick<OrderListItem, 'dueAt'>, now: number) => now > Date.parse(o.dueAt)

/** Vạch màu đầu dòng: TRỄ ưu tiên hơn Giặt nhanh. */
export function rowFlag(o: Pick<OrderListItem, 'dueAt' | 'orderType'>, now: number) {
  if (isLate(o, now)) return 'late' as const
  return o.orderType === 'EXPRESS' ? ('express' as const) : null
}

export type WorkAction = 'classify' | 'start' | 'complete'

export function nextAction(
  o: Pick<OrderListItem, 'status' | 'totalItemsCount'>,
): WorkAction | null {
  if (isUnclassified(o)) return 'classify'
  if (o.status === 'RECEIVED') return 'start'
  if (o.status === 'PROCESSING') return 'complete'
  return null
}

function span(ms: number) {
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)} phút`
  if (ms < 2 * DAY) return `${Math.floor(ms / HOUR)} giờ`
  return `${Math.floor(ms / DAY)} ngày`
}

/** "Trễ 3 giờ" / "Còn 45 phút" / "Còn 2 ngày" */
export function dueHint(o: Pick<OrderListItem, 'dueAt'>, now: number) {
  const diff = Date.parse(o.dueAt) - now
  return diff < 0 ? `Trễ ${span(-diff)}` : `Còn ${span(diff)}`
}

/** Đúng một đơn có mã đơn / mã lượt nhận khớp chính xác (quét QR liên phiếu) → đơn đó. */
export function exactCodeMatch<T extends Pick<OrderListItem, 'orderCode' | 'intakeCode'>>(
  list: T[],
  q: string,
): T | null {
  const code = q.trim().toUpperCase()
  if (!code) return null
  const hits = list.filter(
    (o) => o.orderCode.toUpperCase() === code || o.intakeCode?.toUpperCase() === code,
  )
  return hits.length === 1 ? hits[0] : null
}
