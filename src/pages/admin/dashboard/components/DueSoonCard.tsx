import { Anchor, Card, Group, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { LuListTodo } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import type { OverviewReport } from '@/features/admin/reports'
import { CopyableCode, type DataTableColumn, DataTable, EmptyState } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

type Row = OverviewReport['live']['dueSoon'][number]

const rowKey = (o: Row) => o.orderId
const COLUMNS: DataTableColumn<Row>[] = [
  {
    name: 'code',
    label: 'Mã đơn',
    width: 190,
    render: (o) => <CopyableCode code={o.orderCode} />,
  },
  { name: 'customer', label: 'Khách', render: (o) => o.customerName },
  {
    name: 'dueAt',
    label: 'Hẹn trả',
    width: 110,
    render: (o) => (
      <Text style={{ whiteSpace: 'nowrap' }}>{dayjs(o.dueAt).format('DD/MM HH:mm')}</Text>
    ),
  },
]

const EMPTY = (
  <EmptyState
    icon={<LuListTodo size={32} />}
    title="Không có đơn sắp đến hạn"
    description="Đơn đến hạn trong 24 giờ tới sẽ hiện ở đây."
  />
)

export function DueSoonCard({ rows }: { rows: Row[] }) {
  const navigate = useNavigate()
  const rowProps = (o: Row) => ({
    onClick: () => navigate(PATHS.orderDetail(o.orderId)),
    style: { cursor: 'pointer' },
  })
  return (
    <Card>
      <Group justify="space-between" mb="sm">
        <Title order={5}>Đơn sắp đến hạn 24 giờ tới (hiện tại)</Title>
        <Anchor component={Link} to={PATHS.orders} size="sm">
          Xem tất cả
        </Anchor>
      </Group>
      <DataTable columns={COLUMNS} data={rows} rowKey={rowKey} rowProps={rowProps} empty={EMPTY} />
    </Card>
  )
}
