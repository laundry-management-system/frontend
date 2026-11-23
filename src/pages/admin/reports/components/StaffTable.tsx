import { Button, Card, Group, Title } from '@mantine/core'
import { LuDownload, LuUsers } from 'react-icons/lu'
import { capRows, Leaderboard, METRIC_INFO, type OperationsReport } from '@/features/admin/reports'
import { EmptyState, InfoLabel } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'
import { CapNotice } from './CapNotice'

type Row = OperationsReport['byStaff'][number]

const EMPTY = (
  <EmptyState
    icon={<LuUsers size={32} />}
    title="Chưa có đơn nào trong kỳ"
    description="Số đơn theo nhân viên sẽ hiện ở đây."
  />
)

export function StaffTable({ rows, onExport }: { rows: Row[]; onExport: () => void }) {
  const { shown, truncated } = capRows(rows)
  // fullName null (người dùng không còn) thì hiện tên đăng nhập
  const items = [...shown]
    .sort((a, b) => b.orders - a.orders)
    .map((r) => ({
      key: r.username,
      name: r.fullName ?? r.username,
      value: r.orders,
      primary: `${formatNumber(r.orders)} đơn`,
    }))
  return (
    <Card style={{ flex: '1 1 360px', minWidth: 0 }}>
      <Group justify="space-between" mb="md">
        <Title order={5}>
          <InfoLabel info={METRIC_INFO.ordersByStaff}>Đơn theo nhân viên</InfoLabel>
        </Title>
        <Button
          variant="default"
          size="xs"
          leftSection={<LuDownload size={14} />}
          disabled={rows.length === 0}
          onClick={onExport}
        >
          Xuất CSV
        </Button>
      </Group>
      {rows.length === 0 ? EMPTY : <Leaderboard items={items} />}
      <CapNotice truncated={truncated} />
    </Card>
  )
}
