import { Switch } from '@mantine/core'
import { useDashboardPage } from '../DashboardPageContext'

export function DashboardToolbar() {
  const { autoRefresh, setAutoRefresh } = useDashboardPage()
  return (
    <Switch
      label="Tự làm mới mỗi 5 giây"
      checked={autoRefresh}
      onChange={(e) => setAutoRefresh(e.currentTarget.checked)}
    />
  )
}
