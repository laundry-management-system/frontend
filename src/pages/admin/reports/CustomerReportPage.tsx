import { Skeleton } from '@mantine/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  csvFileName,
  customerCsvRows,
  reportsApi,
  ReportHeader,
  useCustomerReport,
  useReportPeriod,
} from '@/features/admin/reports'
import { downloadCsv } from '@/shared/admin/lib/csv'
import { notify } from '@/shared/common/lib/notify'
import { PATHS } from '@/shared/common/config/paths'
import { CustomerKpis } from './components/CustomerKpis'
import { ReportLoadError } from './components/ReportLoadError'
import { TopCustomersTable } from './components/TopCustomersTable'

const PAGE_INFO =
  'Khách mới là khách có đơn đầu tiên trong kỳ; khách quay lại đã có đơn trước kỳ. Không phân theo kênh và không có bộ gộp theo tháng.'

export default function CustomerReportPage() {
  const { period, error } = useReportPeriod()
  const customers = useCustomerReport(period, !error)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const report = error ? undefined : customers.data

  // CSV lấy đủ dòng từ /customers/spending, không cắt ở top 10
  const exportCsv = async () => {
    setExporting(true)
    try {
      downloadCsv(
        csvFileName('khach-hang', period),
        customerCsvRows(await reportsApi.customerSpending(period)),
      )
    } catch {
      notify.error('Không xuất được CSV, vui lòng thử lại')
    } finally {
      setExporting(false)
    }
  }

  const refreshAll = () => customers.refetch()
  const handleRetry = () => customers.refetch()
  const openCustomer = (id: number) => navigate(PATHS.customerDetail(id))
  return (
    <>
      <ReportHeader
        title="Báo cáo khách hàng"
        info={PAGE_INFO}
        onRefresh={refreshAll}
        hide={['channel', 'mode']}
      />
      {customers.isError ? (
        <ReportLoadError onRetry={handleRetry} />
      ) : (
        <>
          <CustomerKpis report={report} />
          {report ? (
            <TopCustomersTable
              rows={report.topCustomers}
              exporting={exporting}
              onExport={exportCsv}
              onOpen={openCustomer}
            />
          ) : (
            <Skeleton h={240} />
          )}
        </>
      )}
    </>
  )
}
