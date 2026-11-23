import { Group, Skeleton } from '@mantine/core'
import {
  csvFileName,
  ReportHeader,
  staffCsvRows,
  useOperationsReport,
  useReportPeriod,
} from '@/features/admin/reports'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { IncidentSection } from './components/IncidentSection'
import { ReportLoadError } from './components/ReportLoadError'
import { ShiftSection } from './components/ShiftSection'
import { StaffTable } from './components/StaffTable'

const PAGE_INFO =
  'Đơn theo nhân viên: đơn quầy tính cho người tạo, đơn online tính cho nhân viên xác nhận. Ca tính theo ngày đóng ca; sự cố theo ngày ghi nhận; tiền bồi thường theo ngày chi.'

export default function OperationsReportPage() {
  const { period, error } = useReportPeriod()
  const operations = useOperationsReport(period, !error)
  const report = error ? undefined : operations.data
  const refreshAll = () => operations.refetch()
  const handleRetry = () => operations.refetch()

  const exportStaff = () =>
    report && downloadCsv(csvFileName('nhan-vien', period), staffCsvRows(report.byStaff))

  return (
    <>
      <ReportHeader
        title="Báo cáo vận hành"
        info={PAGE_INFO}
        onRefresh={refreshAll}
        hide={['channel']}
      />
      {operations.isError ? (
        <ReportLoadError onRetry={handleRetry} />
      ) : !report ? (
        <Skeleton h={320} />
      ) : (
        <>
          <Group mb="lg" align="stretch">
            <StaffTable rows={report.byStaff} onExport={exportStaff} />
          </Group>
          <ShiftSection shifts={report.shifts} rows={report.shiftRows} />
          <IncidentSection report={report} mode={period.mode} />
        </>
      )}
    </>
  )
}
