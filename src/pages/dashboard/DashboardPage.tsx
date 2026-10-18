import { PageHeader } from '@/shared/ui'
import { DashboardHealth } from './components/DashboardHealth'
import { DashboardToolbar } from './components/DashboardToolbar'
import { DashboardPageProvider } from './DashboardPageContext'

export default function DashboardPage() {
  return (
    <DashboardPageProvider>
      <PageHeader
        title="Tổng quan"
        description="Trang mẫu: gọi GET /api/health qua feature health"
        actions={<DashboardToolbar />}
      />
      <DashboardHealth />
    </DashboardPageProvider>
  )
}
