import { Button, Card, Group, Text, Title } from '@mantine/core'
import { LuDownload, LuUsers } from 'react-icons/lu'
import { type CustomerSpendingRow, Leaderboard, METRIC_INFO } from '@/features/admin/reports'
import { EmptyState, EntityCode, InfoLabel, Money } from '@/shared/admin/ui'
import { formatDate, formatNumber } from '@/shared/common/lib/format'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

const EMPTY = (
  <EmptyState
    icon={<LuUsers size={32} />}
    title="Chưa có khách chi tiêu trong kỳ"
    description="Top khách theo chi tiêu sẽ hiện ở đây."
  />
)

interface TopCustomersTableProps {
  rows: CustomerSpendingRow[]
  exporting: boolean
  onExport: () => void
  onOpen: (customerId: number) => void
}

export function TopCustomersTable({ rows, exporting, onExport, onOpen }: TopCustomersTableProps) {
  const items = rows.map((r) => ({
    key: r.customerId,
    name: r.customerName,
    code: <EntityCode code={r.customerCode} size="sm" />,
    value: r.spent,
    primary: <Money value={r.spent} />,
    onOpen: () => onOpen(r.customerId),
    podiumFoot: (
      <Group justify="space-between" gap="sm">
        <Text size="sm" c="dimmed">
          {formatNumber(r.orderCount)} đơn
        </Text>
        <Text size="sm" c="dimmed">
          {r.lastOrderAt ? `Gần nhất ${formatDate(r.lastOrderAt)}` : ''}
        </Text>
      </Group>
    ),
    rowExtra: (
      <>
        <Text size="sm" c="dimmed" w={70} ta="right" style={TABULAR}>
          {formatNumber(r.orderCount)} đơn
        </Text>
        <Text size="sm" c="dimmed" w={90} ta="right" visibleFrom="sm" style={TABULAR}>
          {r.lastOrderAt ? formatDate(r.lastOrderAt) : ''}
        </Text>
      </>
    ),
  }))
  return (
    <Card>
      <Group justify="space-between" mb="md">
        <Title order={5}>
          <InfoLabel info={METRIC_INFO.topCustomers}>Top khách hàng</InfoLabel>
        </Title>
        <Button
          variant="default"
          size="xs"
          leftSection={<LuDownload size={14} />}
          loading={exporting}
          disabled={rows.length === 0}
          onClick={onExport}
        >
          Xuất CSV
        </Button>
      </Group>
      {rows.length === 0 ? EMPTY : <Leaderboard items={items} />}
    </Card>
  )
}
