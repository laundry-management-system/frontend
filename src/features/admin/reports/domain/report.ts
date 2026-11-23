import type { DateRange, ReportMode, ReportPeriod, RevenueReport, ServiceRow } from './types'

const MAX_DAYS = 366
const DAY_MS = 86_400_000

const isIsoDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s)

const daysInclusive = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / DAY_MS + 1

const lastDayOfMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`
}

export const defaultPeriod = (today: string): ReportPeriod => ({
  from: `${today.slice(0, 8)}01`,
  to: today,
  mode: 'day',
})

/** Đọc kỳ từ URL; thiếu đầu nào thì lấy mặc định đầu đó. */
export function parsePeriod(
  params: { from?: string | null; to?: string | null; mode?: string | null },
  today: string,
): ReportPeriod {
  const fallback = defaultPeriod(today)
  return {
    from: params.from || fallback.from,
    to: params.to || fallback.to,
    mode: params.mode === 'month' ? 'month' : 'day',
  }
}

export function validatePeriod(p: DateRange, today: string): string | null {
  if (!isIsoDate(p.from) || !isIsoDate(p.to)) return 'Ngày không hợp lệ'
  if (p.from > p.to) return 'Ngày bắt đầu không được sau ngày kết thúc'
  if (p.to > today) return 'Không chọn ngày trong tương lai'
  if (daysInclusive(p.from, p.to) > MAX_DAYS) return `Khoảng thời gian tối đa ${MAX_DAYS} ngày`
  return null
}

/** Khoảng ngày của một mốc biểu đồ; mốc tháng bị cắt theo kỳ đang xem. */
export function periodBounds(period: string, mode: ReportMode, range: DateRange): DateRange {
  if (mode === 'day') return { from: period, to: period }
  const start = `${period}-01`
  const end = lastDayOfMonth(period)
  return { from: start < range.from ? range.from : start, to: end > range.to ? range.to : end }
}

export const periodLabel = (period: string, mode: ReportMode) =>
  mode === 'month'
    ? `${period.slice(5, 7)}/${period.slice(0, 4)}`
    : `${period.slice(8, 10)}/${period.slice(5, 7)}`

export function serviceShare(rows: ServiceRow[]) {
  const sum = rows.reduce((s, r) => s + r.revenue, 0)
  return rows.map((r) => ({ ...r, pct: sum > 0 ? (r.revenue * 100) / sum : 0 }))
}

/** Lát nhỏ hơn minPct và dòng không gắn dịch vụ gộp chung một lát "Khác" ở cuối. */
export function pieSlices(rows: ServiceRow[], minPct = 3) {
  const slices: { name: string; value: number; pct: number }[] = []
  const other = { name: 'Khác', value: 0, pct: 0 }
  for (const r of serviceShare(rows)) {
    if (r.revenue <= 0) continue
    if (r.serviceId === null || r.pct < minPct) {
      other.value += r.revenue
      other.pct += r.pct
    } else slices.push({ name: r.serviceName, value: r.revenue, pct: r.pct })
  }
  return other.value > 0 ? [...slices, other] : slices
}

const UNIT_TEXT = { KG: 'kg', PIECE: 'món', SET: 'bộ', PRODUCT: 'sản phẩm' } as const

export const revenueCsvRows = (report: RevenueReport, mode: ReportMode) => [
  ['Mốc', 'Tiền mặt', 'Chuyển khoản', 'Tổng', 'Số giao dịch'],
  ...report.rows.map((r) => [
    periodLabel(r.period, mode),
    r.cash,
    r.bankTransfer,
    r.total,
    r.paymentCount,
  ]),
]

export const serviceCsvRows = (rows: ServiceRow[]) => [
  ['Dịch vụ', 'Lượt sử dụng', 'Tổng KL/SL', 'Đơn vị', 'Doanh thu', 'Tỉ trọng (%)'],
  ...serviceShare(rows).map((r) => [
    r.serviceName,
    r.orderCount,
    r.quantity,
    r.unit ? UNIT_TEXT[r.unit] : null,
    r.revenue,
    Math.round(r.pct * 10) / 10,
  ]),
]

export const csvFileName = (
  kind:
    | 'doanh-thu'
    | 'don-dich-vu'
    | 'don-huy'
    | 'hinh-thuc-giat'
    | 'khach-hang'
    | 'khuyen-mai'
    | 'nhan-vien',
  p: DateRange,
) => `bao-cao-${kind}_${p.from}_${p.to}.csv`
