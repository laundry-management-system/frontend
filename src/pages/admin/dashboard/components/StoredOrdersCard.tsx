import { Anchor, Card, Group, Title } from '@mantine/core'
import { LuPackageCheck } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import type { OverviewReport } from '@/features/admin/reports'
import { CopyableCode, type DataTableColumn, DataTable, EmptyState } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

type Row = OverviewReport['live']['stored'][number]

const rowKey = (o: Row) => o.orderId
const COLUMNS: DataTableColumn<Row>[] = [
  { name: 'code', label: 'Mã đơn', width: 190, render: (o) => <CopyableCode code={o.orderCode} /> },
  { name: 'customer', label: 'Khách', render: (o) => o.customerName },
  {
    name: 'days',
    label: 'Tồn',
    align: 'center',
    width: 80,
    render: (o) => `${o.daysWaiting} ngày`,
  },
]

const EMPTY = (
  <EmptyState
    icon={<LuPackageCheck size={32} />}
    title="Không có đồ tồn"
    description="Đơn hoàn thành lâu mà khách chưa lấy sẽ hiện ở đây."
  />
)

export function StoredOrdersCard({ rows }: { rows: Row[] }) {
  const navigate = useNavigate()
  const rowProps = (o: Row) => ({
    onClick: () => navigate(PATHS.orderDetail(o.orderId)),
    style: { cursor: 'pointer' },
  })
  return (
    <Card>
      <Group justify="space-between" mb="sm">
        <Title order={5}>Đồ tồn cần nhắc (hiện tại)</Title>
        <Anchor component={Link} to={PATHS.ordersStored} size="sm">
          Xem tất cả
        </Anchor>
      </Group>
      <DataTable columns={COLUMNS} data={rows} rowKey={rowKey} rowProps={rowProps} empty={EMPTY} />
    </Card>
  )
}
