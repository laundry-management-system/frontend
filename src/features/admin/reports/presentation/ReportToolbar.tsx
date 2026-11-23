import { Group } from '@mantine/core'
import type { OrderChannel } from '@/features/admin/orders'
import type { ReportPeriod } from '../domain/types'
import { ChannelFilter } from './ChannelFilter'
import { ReportPeriodPicker } from './ReportPeriodPicker'

interface ReportToolbarProps {
  period: ReportPeriod
  error: string | null
  onPeriodChange: (period: ReportPeriod) => void
  channel?: OrderChannel
  onChannelChange?: (channel?: OrderChannel) => void
  hideChannel?: boolean
  hideMode?: boolean
}

/** Bộ chọn kỳ + kênh dùng chung; bộ chọn không áp dụng thì ẩn (không disable). */
export function ReportToolbar({
  period,
  error,
  onPeriodChange,
  channel,
  onChannelChange,
  hideChannel,
  hideMode,
}: ReportToolbarProps) {
  return (
    <Group gap="xs" align="flex-start">
      <ReportPeriodPicker
        value={period}
        error={error}
        onChange={onPeriodChange}
        hideMode={hideMode}
      />
      {!hideChannel && onChannelChange && (
        <ChannelFilter value={channel} onChange={onChannelChange} />
      )}
    </Group>
  )
}
