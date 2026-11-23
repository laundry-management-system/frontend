import { growth } from '../domain/metrics'
import { formatMoney, formatNumber, formatOneDecimal } from '@/shared/common/lib/format'

const sign = (v: number) => (v > 0 ? '+' : '')

/** Chênh lệch so kỳ trước cho StatTile; `inverse` = chỉ số nghịch (tăng là xấu). */
export function periodDelta(cur: number, prev: number, inverse = false, money = false) {
  const fmt = money ? formatMoney : formatNumber
  const g = growth(cur, prev, inverse)
  if (g.noCompare) return { delta: 'Không có dữ liệu so sánh', trend: 'flat' as const }
  return {
    delta: `${sign(g.diff)}${fmt(Math.abs(g.diff))} (${sign(g.diff)}${formatOneDecimal(g.pct ?? 0)}%) so với kỳ trước`,
    trend: g.diff === 0 ? ('flat' as const) : g.bad ? ('down' as const) : ('up' as const),
  }
}
