import { Button, Card, Group, Skeleton, Title } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { LuCloudOff, LuDownload, LuRefreshCw } from 'react-icons/lu'
import {
  csvFileName,
  type OrderReport,
  OrdersLine,
  ReportPeriodPicker,
  serviceCsvRows,
  ServiceShareRing,
  useOrderReport,
} from '@/features/admin/reports'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { EmptyState, IconButton, InfoLabel, PageHeader } from '@/shared/admin/ui'
import { OrderKpis } from './components/OrderKpis'
import { ServiceTable } from './components/ServiceTable'
import { useReportPeriod } from './useReportPeriod'

const PAGE_INFO =
  'Tính trên các đơn nhận trong kỳ (theo ngày nhận đơn), nên có thể lệch với Báo cáo doanh thu vốn tính theo ngày thanh toán. Đơn trễ: đơn không hủy hoàn thành sau giờ hẹn, hoặc chưa hoàn thành mà đã quá hẹn.'
const SERVICE_INFO =
  'Đơn đã hủy không tính vào doanh thu theo dịch vụ. Doanh thu theo dịch vụ là tổng thành tiền các dòng đồ, chưa gồm giảm giá và phụ phí cấp đơn.'
const fmt = (d: string) => dayjs(d).format('DD/MM/YYYY')

export default function OrderReportPage() {
  const { period, error, setPeriod } = useReportPeriod()
  const enabled = !error
  const orders = useOrderReport(period, enabled)
  const queryClient = useQueryClient()
  const report = enabled ? orders.data : undefined

  const refreshAll = () => queryClient.invalidateQueries()
  const handleRetry = () => orders.refetch()
  const exportCsv = () =>
    report && downloadCsv(csvFileName('don-dich-vu', period), serviceCsvRows(report.byService))

  const description = `Kỳ ${fmt(period.from)} – ${fmt(period.to)}`
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

  // Ba khối cùng một nguồn dữ liệu nên lỗi thì cùng hiện một thông báo
  const loadError = (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được báo cáo"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={handleRetry}>Thử lại</Button>}
    />
  )
  const body = (content: (r: OrderReport) => ReactNode, h: number) =>
    orders.isError ? loadError : report ? content(report) : <Skeleton h={h} />
  const lineBody = body((r) => <OrdersLine rows={r.rows} mode={period.mode} />, 220)
  const ringBody = body((r) => <ServiceShareRing rows={r.byService} />, 180)
  const tableBody = body((r) => <ServiceTable rows={r.byService} />, 200)

  return (
    <>
      <PageHeader
        title="Báo cáo đơn hàng & dịch vụ"
        description={description}
        info={PAGE_INFO}
        actions={headerActions}
      />
      <OrderKpis report={report} />
      <Group align="stretch" gap="lg" mb="lg" wrap="wrap">
        <Card style={{ flex: '1 1 520px', minWidth: 0 }}>
          <Title order={5} mb="md">
            Số đơn theo {period.mode === 'month' ? 'tháng' : 'ngày'}
          </Title>
          {lineBody}
        </Card>
        <Card style={{ flex: '0 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Title order={5} mb="md">
            Tỉ trọng doanh thu theo dịch vụ
          </Title>
          {ringBody}
        </Card>
      </Group>
      <Card>
        <Title order={5} mb="md">
          <InfoLabel info={SERVICE_INFO}>Theo dịch vụ</InfoLabel>
        </Title>
        {tableBody}
      </Card>
    </>
  )
}
