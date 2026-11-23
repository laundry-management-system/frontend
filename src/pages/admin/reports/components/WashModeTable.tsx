import { Button, Card, Group, Title } from '@mantine/core'
import { LuDownload, LuWashingMachine } from 'react-icons/lu'
import {
  METRIC_INFO,
  OTHER_COLOR,
  type OrderReport,
  ShareRing,
  type ShareItem,
} from '@/features/admin/reports'
import { EmptyState, InfoLabel } from '@/shared/admin/ui'
import { formatMoney, formatNumber } from '@/shared/common/lib/format'

type Row = OrderReport['byWashMode'][number]

const TOP_N = 5

const EMPTY = (
  <EmptyState
    icon={<LuWashingMachine size={32} />}
    title="Chưa có đơn theo hình thức giặt"
    description="Số đơn và giá trị theo hình thức giặt sẽ hiện ở đây."
  />
)

const detail = (orders: number, amount: number) =>
  `${formatNumber(orders)} đơn · ${formatMoney(amount)}`

interface WashModeTableProps {
  rows: Row[]
  onExport: () => void
}

export function WashModeTable({ rows, onExport }: WashModeTableProps) {
  const sorted = rows.filter((r) => r.amount > 0).sort((a, b) => b.amount - a.amount)
  const items: ShareItem[] = sorted.slice(0, TOP_N).map((r) => ({
    key: r.washModeId ?? 'none',
    label: r.washModeName || 'Chưa có hình thức',
    value: r.amount,
    detail: detail(r.orders, r.amount),
  }))
  const rest = sorted.slice(TOP_N)
  if (rest.length > 0) {
    const amount = rest.reduce((s, r) => s + r.amount, 0)
    const orders = rest.reduce((s, r) => s + r.orders, 0)
    items.push({
      key: 'other',
      label: 'Khác',
      value: amount,
      detail: detail(orders, amount),
      color: OTHER_COLOR,
    })
  }
  const totalOrders = sorted.reduce((s, r) => s + r.orders, 0)
  return (
    <Card style={{ flex: '1 1 420px', minWidth: 0 }}>
      <Group justify="space-between" mb="md">
        <Title order={5}>
          <InfoLabel info={METRIC_INFO.byService}>Theo hình thức giặt</InfoLabel>
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
      {items.length === 0 ? (
        EMPTY
      ) : (
        <ShareRing items={items} centerLabel="Đơn" centerValue={formatNumber(totalOrders)} />
      )}
    </Card>
  )
}
