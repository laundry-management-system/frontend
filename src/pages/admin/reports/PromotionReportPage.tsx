import { SimpleGrid, Skeleton } from '@mantine/core'
import {
  csvFileName,
  METRIC_INFO,
  ReportHeader,
  usePromotionReport,
  useReportPeriod,
  voucherCsvRows,
} from '@/features/admin/reports'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { InfoLabel, Money, StatTile } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'
import { PromotionTable } from './components/PromotionTable'
import { ReportLoadError } from './components/ReportLoadError'

const PAGE_INFO =
  'Tính trên đơn nhận trong kỳ có áp voucher, không gồm đơn đã hủy. Voucher nhóm theo mã đã lưu trên đơn lúc áp dụng.'

export default function PromotionReportPage() {
  const { period, error, channel } = useReportPeriod()
  const promotions = usePromotionReport(period, !error, channel)
  const report = error ? undefined : promotions.data

  const exportCsv = () =>
    report && downloadCsv(csvFileName('khuyen-mai', period), voucherCsvRows(report.byVoucher))

  const refreshAll = () => promotions.refetch()
  const handleRetry = () => promotions.refetch()
  return (
    <>
      <ReportHeader
        title="Báo cáo khuyến mãi"
        info={PAGE_INFO}
        onRefresh={refreshAll}
        hide={['mode']}
      />
      {promotions.isError ? (
        <ReportLoadError onRetry={handleRetry} />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
            <StatTile
              label={<InfoLabel info={METRIC_INFO.voucher}>Lượt dùng voucher</InfoLabel>}
              value={report ? formatNumber(report.uses) : ''}
            />
            <StatTile
              label="Tiền giảm"
              value={report ? <Money value={report.discountTotal} /> : ''}
            />
            <StatTile
              label="Doanh thu đơn có voucher"
              value={report ? <Money value={report.revenue} /> : ''}
            />
          </SimpleGrid>
          {report ? (
            <PromotionTable rows={report.byVoucher} onExport={exportCsv} />
          ) : (
            <Skeleton h={240} />
          )}
        </>
      )}
    </>
  )
}
