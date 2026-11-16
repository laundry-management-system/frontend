import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import { parsePeriod, type ReportPeriod, validatePeriod } from '@/features/reports'

/** Kỳ báo cáo giữ trên URL (`from`, `to`, `mode`) để tải lại / gửi link vẫn đúng kỳ. */
export function useReportPeriod() {
  const [searchParams, setSearchParams] = useSearchParams()
  const today = dayjs().format('YYYY-MM-DD')
  const period = parsePeriod(
    { from: searchParams.get('from'), to: searchParams.get('to'), mode: searchParams.get('mode') },
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

  return { period, error, setPeriod }
}
