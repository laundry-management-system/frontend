import { Group, SegmentedControl } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import dayjs from 'dayjs'
import { LuCalendar } from 'react-icons/lu'
import { matchPreset, presetRange, REPORT_PRESETS, type ReportPreset } from '../domain/presets'
import type { ReportMode, ReportPeriod } from '../domain/types'

const DATE = 'YYYY-MM-DD'
const MODE_OPTIONS = [
  { label: 'Theo ngày', value: 'day' },
  { label: 'Theo tháng', value: 'month' },
]

const PRESET_LABEL: Record<ReportPreset, string> = {
  today: 'Hôm nay',
  '7d': '7 ngày qua',
  '30d': '30 ngày qua',
  thisMonth: 'Tháng này',
  lastMonth: 'Tháng trước',
}
const PRESET_OPTIONS = REPORT_PRESETS.map((p) => ({ label: PRESET_LABEL[p], value: p }))

interface ReportPeriodPickerProps {
  value: ReportPeriod
  error: string | null
  onChange: (period: ReportPeriod) => void
  hideMode?: boolean
}

export function ReportPeriodPicker({ value, error, onChange, hideMode }: ReportPeriodPickerProps) {
  const today = dayjs().format(DATE)
  const handlePresetChange = (p: string) =>
    onChange({ ...value, ...presetRange(p as ReportPreset, today) })
  const handleModeChange = (mode: string) => onChange({ ...value, mode: mode as ReportMode })
  // Chọn đủ hai đầu mới áp dụng
  const handleRangeChange = ([start, end]: DatesRangeValue) => {
    if (!start || !end) return
    onChange({ ...value, from: dayjs(start).format(DATE), to: dayjs(end).format(DATE) })
  }
  const range: [Date | null, Date | null] = [
    dayjs(value.from).isValid() ? dayjs(value.from).toDate() : null,
    dayjs(value.to).isValid() ? dayjs(value.to).toDate() : null,
  ]

  return (
    <Group align="flex-start">
      <SegmentedControl
        aria-label="Kỳ nhanh"
        data={PRESET_OPTIONS}
        value={matchPreset(value, today) ?? ''}
        onChange={handlePresetChange}
      />
      {!hideMode && (
        <SegmentedControl data={MODE_OPTIONS} value={value.mode} onChange={handleModeChange} />
      )}
      <DatePickerInput
        type="range"
        w={260}
        valueFormat="DD/MM/YYYY"
        leftSection={<LuCalendar size={16} />}
        maxDate={new Date()}
        allowSingleDateInRange
        aria-label="Khoảng ngày"
        value={range}
        error={error}
        onChange={handleRangeChange}
      />
    </Group>
  )
}
