import { HealthCard } from '@/features/health'
import { useDashboardPage } from '../DashboardPageContext'

export function DashboardHealth() {
  const { autoRefresh } = useDashboardPage()
  return <HealthCard refetchInterval={autoRefresh ? 5000 : false} />
}
