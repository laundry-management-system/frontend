import { Button, Card, Group, SegmentedControl, Skeleton, Title } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { LuCloudOff, LuDownload, LuRefreshCw } from 'react-icons/lu'
import {
  BANK_COLOR,
  CASH_COLOR,
  csvFileName,
  type DonutSlice,
  ReportPeriodPicker,
  RevenueBars,
  type BarSeries,
  RevenueDonut,
  revenueCsvRows,
  useDashboard,
  useRevenueReport,
} from '@/features/admin/reports'
import { ORDER_CHANNEL_LABEL } from '@/features/admin/orders'
import { useMe } from '@/features/admin/users'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { EmptyState, IconButton, PageHeader } from '@/shared/admin/ui'
import { ChannelFilter } from './components/ChannelFilter'
import { RevenueKpis } from './components/RevenueKpis'
import { ShiftReconcileCard } from './components/ShiftReconcileCard'
import { useReportPeriod } from './useReportPeriod'

const PAGE_INFO =
  'Chỉ tính giao dịch đã xác nhận, theo thời điểm thanh toán; giao dịch đã hủy hoặc hoàn tiền không được tính. Tăng trưởng so với kỳ liền trước cùng số ngày.'
const fmt = (d: string) => dayjs(d).format('DD/MM/YYYY')

type DonutMode = 'method' | 'channel'
const MODES = [
  { value: 'method', label: 'Hình thức thanh toán' },
  { value: 'channel', label: 'Kênh' },
]
const CHANNEL_COLOR = { ONLINE: 'var(--tone-express-solid)', OFFLINE: 'var(--tone-neutral-solid)' }
const CHANNEL_SERIES: BarSeries[] = [
  { label: ORDER_CHANNEL_LABEL.OFFLINE, color: CHANNEL_COLOR.OFFLINE, value: (r) => r.offline },
  { label: ORDER_CHANNEL_LABEL.ONLINE, color: CHANNEL_COLOR.ONLINE, value: (r) => r.online },
]

export default function RevenueReportPage() {
  const [mode, setMode] = useState<DonutMode>('method')
  const { period, error, setPeriod, channel, setChannel } = useReportPeriod()
  const enabled = !error
  const revenue = useRevenueReport(period, enabled, channel)
  const dashboard = useDashboard({ from: period.from, to: period.to }, enabled)
  const { data: me } = useMe()
  const queryClient = useQueryClient()
  const report = enabled ? revenue.data : undefined

  const refreshAll = () => queryClient.invalidateQueries()
  const retryRevenue = () => revenue.refetch()
  const exportCsv = () =>
    report && downloadCsv(csvFileName('doanh-thu', period), revenueCsvRows(report, period.mode))

  const description = `Kỳ ${fmt(period.from)} – ${fmt(period.to)}${me ? ` · lập bởi ${me.fullName}` : ''}`
  const headerActions = (
    <Group gap="xs" align="flex-start">
      <ReportPeriodPicker value={period} error={error} onChange={setPeriod} />
      <ChannelFilter value={channel} onChange={setChannel} />
      <IconButton label="Làm mới" icon={<LuRefreshCw size={16} />} onClick={refreshAll} />
      <Button
        variant="default"
        leftSection={<LuDownload size={16} />}
        disabled={!report}
        onClick={exportCsv}
      >
        Xuất CSV
      </Button>
    </Group>
  )

  const revenueError = (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được doanh thu"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={retryRevenue}>Thử lại</Button>}
    />
  )
  const chartBody = revenue.isError ? (
    revenueError
  ) : report ? (
    <RevenueBars
      rows={report.rows}
      split
      series={mode === 'channel' ? CHANNEL_SERIES : undefined}
      mode={period.mode}
      range={period}
      channel={channel}
      emptyText="Kỳ này chưa có thanh toán nào được xác nhận."
    />
  ) : (
    <Skeleton h={200} />
  )
  const slices: DonutSlice[] =
    mode === 'method'
      ? [
          {
            key: 'cash',
            label: 'Tiền mặt',
            color: CASH_COLOR,
            amount: report?.summary.cash ?? 0,
            count: report?.summary.cashCount ?? 0,
          },
          {
            key: 'qr',
            label: 'Chuyển khoản (QR)',
            color: BANK_COLOR,
            amount: report?.summary.bankTransfer ?? 0,
            count: report?.summary.bankTransferCount ?? 0,
          },
        ]
      : (report?.byChannel ?? []).map((c) => ({
          key: c.channel,
          label: ORDER_CHANNEL_LABEL[c.channel],
          color: CHANNEL_COLOR[c.channel],
          amount: c.amount,
          count: c.count,
        }))
  const donutBody = revenue.isError ? (
    revenueError
  ) : report ? (
    <RevenueDonut slices={slices} emptyText="Kỳ này chưa có thanh toán nào được xác nhận." />
  ) : (
    <Skeleton h={260} />
  )

  return (
    <>
      <PageHeader
        title="Báo cáo doanh thu"
        description={description}
        info={PAGE_INFO}
        actions={headerActions}
      />
      <RevenueKpis report={report} dashboard={enabled ? dashboard.data : undefined} />
      <Group justify="flex-end" mb="sm">
        <SegmentedControl
          aria-label="Xem cơ cấu doanh thu theo"
          data={MODES}
          value={mode}
          onChange={(v) => setMode(v as DonutMode)}
        />
      </Group>
      <Group align="stretch" gap="lg" wrap="wrap" mb="lg">
        <Card style={{ flex: '2 1 480px', minWidth: 0 }}>
          <Title order={5} mb="md">
            Doanh thu theo {period.mode === 'month' ? 'tháng' : 'ngày'}
          </Title>
          {chartBody}
        </Card>
        <Card style={{ flex: '1 1 300px', minWidth: 0 }}>
          <Title order={5} mb="md">
            {mode === 'method' ? 'Theo hình thức thanh toán' : 'Theo kênh'}
          </Title>
          {donutBody}
        </Card>
      </Group>
      <Group align="flex-start" gap="lg" wrap="wrap">
        <ShiftReconcileCard />
      </Group>
    </>
  )
}
