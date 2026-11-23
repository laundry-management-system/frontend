export const MAX_TABLE_ROWS = 5000

/** Chênh lệch kỳ này so kỳ trước; `inverse` = chỉ số nghịch (trễ/hủy/sự cố) tăng là xấu. */
export function growth(cur: number, prev: number, inverse = false) {
  const diff = cur - prev
  const noCompare = prev === 0 && cur > 0
  const pct = prev === 0 ? (noCompare ? null : 0) : Math.round((diff / prev) * 1000) / 10
  return { diff, pct, noCompare, bad: inverse ? diff > 0 : diff < 0 }
}

export function capRows<T>(rows: T[]) {
  return { shown: rows.slice(0, MAX_TABLE_ROWS), truncated: rows.length > MAX_TABLE_ROWS }
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
