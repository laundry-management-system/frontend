import { Button, Group } from '@mantine/core'
import { LuDownload, LuRefreshCw } from 'react-icons/lu'
import { IconButton, PageHeader } from '@/shared/admin/ui'
import { formatDate } from '@/shared/common/lib/format'
import { useReportPeriod } from '../application/useReportPeriod'
import { ReportToolbar } from './ReportToolbar'

interface ReportHeaderProps {
  title: string
  info: string
  onRefresh: () => void
  /** Bộ chọn không áp dụng cho báo cáo này thì ẩn. */
  hide?: ('channel' | 'mode')[]
  /** Nối sau mô tả kỳ. */
  descriptionSuffix?: string
  /** Có `onExport` thì hiện nút "Xuất CSV" ở đầu trang. */
  onExport?: () => void
  exportDisabled?: boolean
}

/** Đầu trang báo cáo: tiêu đề, mô tả kỳ, bộ chọn kỳ/kênh (đọc từ URL), làm mới, xuất CSV. */
export function ReportHeader({
  title,
  info,
  onRefresh,
  hide = [],
  descriptionSuffix = '',
  onExport,
  exportDisabled,
}: ReportHeaderProps) {
  const { period, error, setPeriod, channel, setChannel } = useReportPeriod()
  return (
    <PageHeader
      title={title}
      description={`Kỳ ${formatDate(period.from)} – ${formatDate(period.to)}${descriptionSuffix}`}
      info={info}
      actions={
        <Group gap="xs" align="flex-start">
          <ReportToolbar
            period={period}
            error={error}
            onPeriodChange={setPeriod}
            channel={channel}
            onChannelChange={setChannel}
            hideChannel={hide.includes('channel')}
            hideMode={hide.includes('mode')}
          />
          <IconButton label="Làm mới" icon={<LuRefreshCw size={16} />} onClick={onRefresh} />
          {onExport && (
            <Button
              variant="default"
              leftSection={<LuDownload size={16} />}
              disabled={exportDisabled}
              onClick={onExport}
            >
              Xuất CSV
            </Button>
          )}
        </Group>
      }
    />
  )
}
