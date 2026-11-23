import type { DateRange } from './types'

export type ReportPreset = 'today' | '7d' | '30d' | 'thisMonth' | 'lastMonth'

const addDays = (isoDate: string, n: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** `today` dạng yyyy-MM-dd. 7d/30d gồm cả hôm nay; thisMonth từ ngày 1; lastMonth là cả tháng trước. */
export function presetRange(preset: ReportPreset, today: string): DateRange {
  const monthStart = `${today.slice(0, 8)}01`
  switch (preset) {
    case '7d':
      return { from: addDays(today, -6), to: today }
    case '30d':
      return { from: addDays(today, -29), to: today }
    case 'thisMonth':
      return { from: monthStart, to: today }
    case 'lastMonth': {
      const to = addDays(monthStart, -1)
      return { from: `${to.slice(0, 8)}01`, to }
    }
    default:
      return { from: today, to: today }
  }
}

export const REPORT_PRESETS: ReportPreset[] = ['today', '7d', '30d', 'thisMonth', 'lastMonth']

export function matchPreset(range: DateRange, today: string): ReportPreset | undefined {
  return REPORT_PRESETS.find((p) => {
    const r = presetRange(p, today)
    return r.from === range.from && r.to === range.to
  })
}
