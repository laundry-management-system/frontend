import { Switch } from '@mantine/core'
import type { ChangeEvent } from 'react'
import { useDashboardPage } from '../DashboardPageContext'

export function DashboardToolbar() {
  const { autoRefresh, setAutoRefresh } = useDashboardPage()
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setAutoRefresh(e.currentTarget.checked)

  return <Switch label="Tự làm mới mỗi 5 giây" checked={autoRefresh} onChange={handleChange} />
}
