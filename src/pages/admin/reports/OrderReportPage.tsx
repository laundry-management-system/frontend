import { Card, Group, Skeleton, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import {
  ChannelBreakdown,
  cancelReasonCsvRows,
  csvFileName,
  type OrderReport,
  OrdersLine,
  ReportHeader,
  serviceCsvRows,
  ServiceShareRing,
  useOrderReport,
  useReportPeriod,
  washModeCsvRows,
} from '@/features/admin/reports'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { InfoLabel } from '@/shared/admin/ui'
import { CancelReasonCard } from './components/CancelReasonCard'
import { OnlineFunnelCard } from './components/OnlineFunnelCard'
import { OrderKpis } from './components/OrderKpis'
import { ProcessingCard } from './components/ProcessingCard'
import { ReportLoadError } from './components/ReportLoadError'
import { ServiceTable } from './components/ServiceTable'
import { WashModeTable } from './components/WashModeTable'

const PAGE_INFO =
  'Tính trên các đơn nhận trong kỳ (theo ngày nhận đơn), nên có thể lệch với Báo cáo doanh thu vốn tính theo ngày thanh toán. Đơn trễ trong kỳ: đơn có hẹn trả trong kỳ mà sẵn sàng sau hẹn hoặc chưa sẵn sàng.'
const SERVICE_INFO =
  'Đơn đã hủy không tính vào doanh thu theo dịch vụ. Doanh thu theo dịch vụ là tổng thành tiền các dòng đồ, chưa gồm giảm giá và phụ phí cấp đơn.'

export default function OrderReportPage() {
  const { period, error, channel } = useReportPeriod()
  const enabled = !error
  const orders = useOrderReport(period, enabled, channel)
  const report = enabled ? orders.data : undefined

  const refreshAll = () => orders.refetch()
  const handleRetry = () => orders.refetch()
  const exportCsv = () =>
    report && downloadCsv(csvFileName('don-dich-vu', period), serviceCsvRows(report.byService))

  const exportCancel = () =>
    report && downloadCsv(csvFileName('don-huy', period), cancelReasonCsvRows(report.cancelReasons))
  const exportWashMode = () =>
    report && downloadCsv(csvFileName('hinh-thuc-giat', period), washModeCsvRows(report.byWashMode))

  const body = (content: (r: OrderReport) => ReactNode, h: number) =>
    report ? content(report) : <Skeleton h={h} />
  const lineBody = body((r) => <OrdersLine rows={r.rows} mode={period.mode} />, 220)
  const ringBody = body((r) => <ServiceShareRing rows={r.byService} />, 180)
  const channelBody = body((r) => <ChannelBreakdown rows={r.byChannel} countLabel="Số đơn" />, 100)
  const tableBody = body((r) => <ServiceTable rows={r.byService} />, 200)

  return (
    <>
      <ReportHeader
        title="Báo cáo đơn hàng & dịch vụ"
        info={PAGE_INFO}
        onRefresh={refreshAll}
        onExport={exportCsv}
        exportDisabled={!report}
      />
      {orders.isError ? (
        <ReportLoadError onRetry={handleRetry} />
      ) : (
        <>
          <OrderKpis report={report} />
          <Group align="stretch" gap="lg" mb="lg" wrap="wrap">
            <Card style={{ flex: '1 1 520px', minWidth: 0 }}>
              <Title order={5} mb="md">
                Số đơn theo {period.mode === 'month' ? 'tháng' : 'ngày'}
              </Title>
              {lineBody}
            </Card>
            <Card
              style={{ flex: '0 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column' }}
            >
              <Title order={5} mb="md">
                Tỉ trọng doanh thu theo dịch vụ
              </Title>
              {ringBody}
            </Card>
          </Group>
          <Group align="stretch" gap="lg" mb="lg" wrap="wrap">
            {body(
              (r) => (
                <>
                  <ProcessingCard processing={r.processing} />
                  <CancelReasonCard reasons={r.cancelReasons} onExport={exportCancel} />
                </>
              ),
              200,
            )}
          </Group>
          <Group align="stretch" gap="lg" mb="lg" wrap="wrap">
            {body(
              (r) => (
                <>
                  <WashModeTable rows={r.byWashMode} onExport={exportWashMode} />
                  {channel !== 'OFFLINE' && r.online && <OnlineFunnelCard online={r.online} />}
                </>
              ),
              200,
            )}
          </Group>
          <Card mb="lg">
            <Title order={5} mb="md">
              Theo kênh
            </Title>
            {channelBody}
          </Card>
          <Card>
            <Title order={5} mb="md">
              <InfoLabel info={SERVICE_INFO}>Theo dịch vụ</InfoLabel>
            </Title>
            {tableBody}
          </Card>
        </>
      )}
    </>
  )
}
