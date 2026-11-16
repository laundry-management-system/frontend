import { Anchor, Button, Card, Group, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { LuCloudOff, LuListTodo } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import { dueHint, isLate, type OrderListItem, useNow, useWorkOrders } from '@/features/orders'
import { CopyableCode, type DataTableColumn, DataTable, EmptyState, StatusBadge } from '@/shared/ui'

const PARAMS = { tab: 'ALL', q: '', page: 0, size: 5 } as const

export function DueSoonCard() {
  const navigate = useNavigate()
  const now = useNow()
  const { data, isLoading, isError, refetch } = useWorkOrders(PARAMS)
  const openOrder = (o: OrderListItem) => navigate(`/orders/${o.id}`)
  const handleRetry = () => refetch()
  const rowKey = (o: OrderListItem) => o.id
  const rowProps = (o: OrderListItem) => ({
    onClick: () => openOrder(o),
    style: { cursor: 'pointer' },
  })

  const columns: DataTableColumn<OrderListItem>[] = [
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
    {
      name: 'flag',
      label: '',
      width: 100,
      align: 'right',
      render: (o) =>
        isLate(o, now) ? (
          <StatusBadge group="flag" statusKey="late" size="sm" />
        ) : (
          <Text size="sm" c="dimmed">
            {dueHint(o, now)}
          </Text>
        ),
    },
  ]

  const empty = isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được danh sách"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={handleRetry}>Thử lại</Button>}
    />
  ) : (
    <EmptyState
      icon={<LuListTodo size={32} />}
      title="Không còn đơn nào cần làm"
      description="Đơn sắp đến hạn sẽ hiện ở đây."
    />
  )

  return (
    <Card>
      <Group justify="space-between" mb="sm">
        <Title order={5}>Đơn sắp đến hạn / trễ</Title>
        <Anchor component={Link} to="/work-list" size="sm">
          Xem tất cả
        </Anchor>
      </Group>
      <DataTable
        columns={columns}
        data={isError ? [] : (data?.content ?? [])}
        rowKey={rowKey}
        rowProps={rowProps}
        loading={isLoading}
        empty={empty}
      />
    </Card>
  )
}
