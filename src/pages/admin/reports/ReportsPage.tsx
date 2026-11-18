import { type TabDef, TabbedPage } from '@/shared/admin/ui'
import OrderReportPage from './OrderReportPage'
import RevenueReportPage from './RevenueReportPage'

const TABS: TabDef[] = [
  { value: 'revenue', label: 'Doanh thu', content: <RevenueReportPage /> },
  { value: 'orders', label: 'Đơn & dịch vụ', content: <OrderReportPage /> },
]
// Hai tab cùng kỳ báo cáo nên đổi tab giữ nguyên kỳ đang chọn
const SHARED_KEYS = ['from', 'to', 'mode']

export default function ReportsPage() {
  return <TabbedPage tabs={TABS} sharedKeys={SHARED_KEYS} />
}
