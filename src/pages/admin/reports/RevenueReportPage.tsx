import { Anchor, Card, Group, SegmentedControl, Skeleton, Title } from '@mantine/core'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BANK_COLOR,
  CASH_COLOR,
  csvFileName,
  type DonutSlice,
  ReportHeader,
  RevenueBars,
  type BarSeries,
  RevenueDonut,
  revenueCsvRows,
  useReportPeriod,
  useRevenueReport,
} from '@/features/admin/reports'
import { ORDER_CHANNEL_LABEL } from '@/features/admin/orders'
import { useMe } from '@/features/admin/users'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { PATHS } from '@/shared/common/config/paths'
import { ReportLoadError } from './components/ReportLoadError'
import { RevenueKpis } from './components/RevenueKpis'

const PAGE_INFO =
  'Chỉ tính giao dịch đã xác nhận, theo thời điểm thanh toán; giao dịch đã hủy hoặc hoàn tiền không được tính. Tăng trưởng so với kỳ liền trước cùng số ngày.'

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
  const { period, error, channel } = useReportPeriod()
  const enabled = !error
  const revenue = useRevenueReport(period, enabled, channel)
  const { data: me } = useMe()
  const report = enabled ? revenue.data : undefined

  const refreshAll = () => revenue.refetch()
  const retryRevenue = () => revenue.refetch()
  const handleModeChange = (v: string) => setMode(v as DonutMode)
  const exportCsv = () =>
    report && downloadCsv(csvFileName('doanh-thu', period), revenueCsvRows(report, period.mode))

  const chartBody = report ? (
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
  const donutBody = report ? (
    <RevenueDonut slices={slices} emptyText="Kỳ này chưa có thanh toán nào được xác nhận." />
  ) : (
    <Skeleton h={260} />
  )

  return (
    <>
      <ReportHeader
        title="Báo cáo doanh thu"
        info={PAGE_INFO}
        descriptionSuffix={me ? ` · lập bởi ${me.fullName}` : ''}
        onRefresh={refreshAll}
        onExport={exportCsv}
        exportDisabled={!report}
      />
      {revenue.isError ? (
        <ReportLoadError onRetry={retryRevenue} />
      ) : (
        <>
          <RevenueKpis report={report} />
          <Group justify="flex-end" mb="sm">
            <SegmentedControl
              aria-label="Xem cơ cấu doanh thu theo"
              data={MODES}
              value={mode}
              onChange={handleModeChange}
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
          <Anchor component={Link} to={PATHS.shifts} size="sm">
            Đối soát ca
          </Anchor>
        </>
      )}
    </>
  )
}
