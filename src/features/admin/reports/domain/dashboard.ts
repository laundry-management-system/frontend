import type { DashboardPreset, DateRange } from './types'

const addDays = (isoDate: string, n: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** `today` dạng yyyy-MM-dd theo giờ địa phương. "Tháng này" = từ ngày 1 tới hôm nay. */
export function presetRange(preset: DashboardPreset, today: string): DateRange {
  if (preset === '7d') return { from: addDays(today, -6), to: today }
  if (preset === 'month') return { from: `${today.slice(0, 8)}01`, to: today }
  return { from: today, to: today }
}

export const last14Days = (today: string): DateRange => ({ from: addDays(today, -13), to: today })

export function delta(curr: number, prev: number) {
  const diff = curr - prev
  return {
    diff,
    trend: diff > 0 ? ('up' as const) : diff < 0 ? ('down' as const) : ('flat' as const),
  }
}

/** Tỉ lệ tiền mặt / chuyển khoản, tổng luôn 100; chưa có doanh thu → null. */
export function paymentShare({ cash, total }: { cash: number; total: number }) {
  if (total <= 0) return null
  const cashPct = Math.round((cash * 100) / total)
  return { cashPct, bankPct: 100 - cashPct }
}

/** Mốc tròn cho trục y: bước 1 / 2 / 2,5 / 5 × 10ⁿ, mốc cuối ≥ giá trị lớn nhất. */
export function niceTicks(max: number, target = 4) {
  if (max <= 0) return [0]
  const rough = max / target
  const mag = 10 ** Math.floor(Math.log10(rough))
  const norm = rough / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const count = Math.ceil(max / step)
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

/** Chiều cao tương đối 0–1 theo mốc cao nhất của trục. */
export function barHeights(values: number[], scaleMax: number) {
  return values.map((v) => (scaleMax <= 0 ? 0 : v / scaleMax))
}

/** Nhãn trục gọn: 300k, 1,2tr */
export function compactMoney(n: number) {
  if (n === 0) return '0'
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`
  return `${(n / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`
}
