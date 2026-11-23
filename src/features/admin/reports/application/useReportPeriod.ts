import dayjs from 'dayjs'
import type { OrderChannel } from '@/features/admin/orders'
import { useSearchParams } from 'react-router-dom'
import { parsePeriod, validatePeriod } from '../domain/report'
import { presetRange, type ReportPreset } from '../domain/presets'
import type { ReportPeriod } from '../domain/types'

/** Kỳ báo cáo giữ trên URL (`from`, `to`, `mode`, `channel`); thiếu thì dùng kỳ nhanh `defaultPreset`. */
export function useReportPeriod(defaultPreset: ReportPreset = 'thisMonth') {
  const [searchParams, setSearchParams] = useSearchParams()
  const today = dayjs().format('YYYY-MM-DD')
  const fallback = presetRange(defaultPreset, today)
  const period = parsePeriod(
    {
      from: searchParams.get('from') || fallback.from,
      to: searchParams.get('to') || fallback.to,
      mode: searchParams.get('mode'),
    },
    today,
  )
  const error = validatePeriod(period, today)

  const setPeriod = (p: ReportPeriod) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('from', p.from)
        next.set('to', p.to)
        next.set('mode', p.mode)
        return next
      },
      { replace: true },
    )

  const raw = searchParams.get('channel')
  const channel: OrderChannel | undefined = raw === 'ONLINE' || raw === 'OFFLINE' ? raw : undefined
  const setChannel = (c?: OrderChannel) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (c) next.set('channel', c)
        else next.delete('channel')
        return next
      },
      { replace: true },
    )

  return { period, error, setPeriod, channel, setChannel }
}
