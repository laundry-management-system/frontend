import { Button, Card, Group, SimpleGrid, Skeleton } from '@mantine/core'
import { LuCloudOff, LuRefreshCw } from 'react-icons/lu'
import { ReportToolbar, useOverviewReport, useReportPeriod } from '@/features/admin/reports'
import { EmptyState, IconButton, PageHeader } from '@/shared/admin/ui'
import { DueSoonCard } from './components/DueSoonCard'
import { KpiRow } from './components/KpiRow'
import { OrderFlow } from './components/OrderFlow'
import { StoredOrdersCard } from './components/StoredOrdersCard'

export default function DashboardPage() {
  const { period, error, setPeriod } = useReportPeriod('today')
  const overview = useOverviewReport(period, !error)
  const { data } = overview

  const refreshAll = () => overview.refetch()
  const headerActions = (
    <Group gap="xs" align="flex-start">
      <ReportToolbar
        period={period}
        error={error}
        onPeriodChange={setPeriod}
        hideChannel
        hideMode
      />
      <IconButton label="Làm mới" icon={<LuRefreshCw size={16} />} onClick={refreshAll} />
    </Group>
  )

  const body = overview.isError ? (
    <Card>
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được số liệu"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={<Button onClick={refreshAll}>Thử lại</Button>}
      />
    </Card>
  ) : data ? (
    <>
      <KpiRow data={data} period={period} />
      <OrderFlow live={data.live} />
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <DueSoonCard rows={data.live.dueSoon} />
        <StoredOrdersCard rows={data.live.stored} />
      </SimpleGrid>
    </>
  ) : (
    !error && (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={110} radius="md" />
        ))}
      </SimpleGrid>
    )
  )

  return (
    <>
      <PageHeader title="Tổng quan" actions={headerActions} />
      {body}
    </>
  )
}
