import {
  PRICE_FIELD_LABEL,
  SERVICE_STATUS_LABEL,
  type PriceField,
  type PriceHistoryRow,
  type ServiceStatus,
} from './types.ts'

// domain không import shared: tự định dạng tiền / giờ theo DS
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`
const percentFormat = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const pad = (n: number) => String(n).padStart(2, '0')
const dayMonth = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
const fullDate = (d: Date) => `${dayMonth(d)}/${d.getFullYear()}`
const time = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

const MONEY_FIELDS: readonly PriceField[] = ['PRICE', 'EXPRESS_SURCHARGE']

export function formatPriceValue(field: PriceField, value: string | null) {
  if (value == null) return field === 'STATUS' ? '—' : 'Không hỗ trợ'
  if (field === 'STATUS') return SERVICE_STATUS_LABEL[value as ServiceStatus] ?? value
  if (MONEY_FIELDS.includes(field)) return money(Number(value))
  return `${value} giờ`
}

export type DeltaDirection = 'up' | 'down' | 'same'

/** Chênh lệch % so với giá cũ; chỉ tính cho tiền khi cả hai có giá trị và giá cũ > 0, còn lại `null` (hiện "—"). */
export function priceRowDelta(
  row: Pick<PriceHistoryRow, 'field' | 'oldValue' | 'newValue'>,
): { label: string; direction: DeltaDirection } | null {
  if (!MONEY_FIELDS.includes(row.field) || row.oldValue == null || row.newValue == null) return null
  const oldValue = Number(row.oldValue)
  if (!(oldValue > 0)) return null
  const diff = Number(row.newValue) - oldValue
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : ''
  return {
    label: `${sign}${percentFormat.format(Math.abs((diff / oldValue) * 100))}%`,
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
  }
}

/** Cùng năm: "16/09 16:10"; khác năm: "16/09/2025 16:10" */
export function formatChangedAt(iso: string, now = new Date()) {
  const d = new Date(iso)
  return `${d.getFullYear() === now.getFullYear() ? dayMonth(d) : fullDate(d)} ${time(d)}`
}

export interface PricePeriod {
  label: string
  price: number
  current: boolean
}

/** Nhiều lần đổi trong một ngày gộp thành một: giá cũ đầu ngày → giá mới cuối ngày; về lại giá cũ thì bỏ */
function mergeSameDay(changes: PriceHistoryRow[]) {
  const merged: PriceHistoryRow[] = []
  for (const c of changes) {
    const last = merged.at(-1)
    if (last && fullDate(new Date(last.changedAt)) === fullDate(new Date(c.changedAt))) {
      merged[merged.length - 1] = { ...c, oldValue: last.oldValue }
    } else {
      merged.push(c)
    }
  }
  return merged.filter((c) => Number(c.oldValue) !== Number(c.newValue))
}

/**
 * Các mốc đơn giá của một dịch vụ từ các dòng PRICE (thứ tự bất kỳ) và giá hiện tại, mỗi ngày tối đa một mốc.
 * Lần đổi trước khi có tính năng không được ghi: giá cũ của lần đổi đầu tiên coi là giá trước đó.
 */
export function buildPricePeriods(rows: PriceHistoryRow[], currentPrice: number) {
  const changes = mergeSameDay(
    rows
      .filter((r) => r.field === 'PRICE')
      .toSorted((a, b) => a.changedAt.localeCompare(b.changedAt) || a.logId - b.logId),
  )
  if (changes.length === 0) {
    return {
      periods: [{ label: 'Hiện tại', price: currentPrice, current: true }] as PricePeriod[],
      points: [] as { at: string; price: number }[],
      reminder: null,
    }
  }

  const at = changes.map((c) => new Date(c.changedAt))
  const last = changes.length - 1
  const periods: PricePeriod[] = [
    { label: `Từ ${fullDate(at[last])}`, price: currentPrice, current: true },
  ]
  for (let i = last; i >= 1; i--) {
    const end = new Date(at[i].getTime() - 24 * 60 * 60 * 1000)
    const label =
      fullDate(end) === fullDate(at[i - 1]) || end < at[i - 1]
        ? fullDate(at[i - 1])
        : `${dayMonth(at[i - 1])} – ${fullDate(end)}`
    periods.push({ label, price: Number(changes[i].oldValue), current: false })
  }
  periods.push({
    label: `Trước ${fullDate(at[0])}`,
    price: Number(changes[0].oldValue),
    current: false,
  })

  const points = [
    { at: changes[0].changedAt, price: Number(changes[0].oldValue) },
    ...changes.map((c) => ({ at: c.changedAt, price: Number(c.newValue) })),
  ]
  // Điểm đầu là giá cũ ngay tại mốc đầu; biểu đồ vẽ bậc thang nên giá trị cuối kéo tới hiện tại
  points[points.length - 1] = { ...points[points.length - 1], price: currentPrice }

  return {
    periods,
    points,
    reminder: `Đơn nhận trước ${dayMonth(at[last])} vẫn tính ${money(Number(changes[last].oldValue))}.`,
  }
}

export const PRICE_HISTORY_CSV_HEADER = [
  'STT',
  'Dịch vụ',
  'Loại thay đổi',
  'Giá trị cũ',
  'Giá trị mới',
  'Chênh lệch',
  'Người sửa',
  'Thời gian',
  'Lý do',
]

export const priceHistoryCsvRows = (rows: PriceHistoryRow[]) => [
  PRICE_HISTORY_CSV_HEADER,
  ...rows.map((r, i) => {
    const d = new Date(r.changedAt)
    return [
      String(i + 1),
      r.serviceName,
      PRICE_FIELD_LABEL[r.field],
      formatPriceValue(r.field, r.oldValue),
      formatPriceValue(r.field, r.newValue),
      priceRowDelta(r)?.label ?? '—',
      r.changedByName,
      `${fullDate(d)} ${time(d)}`,
      r.reason,
    ]
  }),
]

export const priceHistoryCsvName = (from?: string, to?: string) =>
  `lich-su-doi-gia_${from ?? 'dau'}_${to ?? 'nay'}.csv`
