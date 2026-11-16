import { Button, Card, Group, Skeleton, Title } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { LuCloudOff, LuDownload, LuRefreshCw } from 'react-icons/lu'
import {
  csvFileName,
  ReportPeriodPicker,
  RevenueBars,
  revenueCsvRows,
  useDashboard,
  useRevenueReport,
} from '@/features/reports'
import { useMe } from '@/features/users'
import { downloadCsv } from '@/shared/lib/csv'
import { EmptyState, IconButton, PageHeader } from '@/shared/ui'
import { MethodTable } from './components/MethodTable'
import { RevenueKpis } from './components/RevenueKpis'
import { ShiftReconcileCard } from './components/ShiftReconcileCard'
import { useReportPeriod } from './useReportPeriod'

const PAGE_INFO =
  'Chỉ tính giao dịch đã xác nhận, theo thời điểm thanh toán; giao dịch đã hủy hoặc hoàn tiền không được tính. Tăng trưởng so với kỳ liền trước cùng số ngày.'
const fmt = (d: string) => dayjs(d).format('DD/MM/YYYY')

export default function RevenueReportPage() {
  const { period, error, setPeriod } = useReportPeriod()
  const enabled = !error
  const revenue = useRevenueReport(period, enabled)
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
      mode={period.mode}
      range={period}
      emptyText="Kỳ này chưa có thanh toán nào được xác nhận."
    />
  ) : (
    <Skeleton h={200} />
  )
  const methodBody = revenue.isError ? (
    revenueError
  ) : report ? (
    <MethodTable summary={report.summary} />
  ) : (
    <Skeleton h={120} />
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
      <Card mb="lg">
        <Title order={5} mb="md">
          Doanh thu theo {period.mode === 'month' ? 'tháng' : 'ngày'}
        </Title>
        {chartBody}
      </Card>
      <Group align="flex-start" gap="lg" wrap="wrap">
        <Card style={{ flex: '1 1 380px', minWidth: 0 }}>
          <Title order={5} mb="md">
            Theo phương thức thanh toán
          </Title>
          {methodBody}
        </Card>
        <ShiftReconcileCard />
      </Group>
    </>
  )
}
