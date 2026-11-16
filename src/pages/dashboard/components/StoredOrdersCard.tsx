import { Button, Card, Group, Title } from '@mantine/core'
import { LuCloudOff, LuPackageCheck } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { type StoredOrder, useOverdueOrders } from '@/features/orders'
import { CopyableCode, type DataTableColumn, DataTable, EmptyState } from '@/shared/ui'

const COLUMNS: DataTableColumn<StoredOrder>[] = [
  { name: 'code', label: 'Mã đơn', width: 190, render: (o) => <CopyableCode code={o.orderCode} /> },
  { name: 'customer', label: 'Khách', render: (o) => o.customerName },
  {
    name: 'days',
    label: 'Tồn',
    align: 'center',
    width: 80,
    render: (o) => `${o.daysInStorage} ngày`,
  },
  {
    name: 'notify',
    label: 'Đã nhắc',
    align: 'center',
    width: 100,
    render: (o) => `${o.notifyCount} lần`,
  },
]

export function StoredOrdersCard() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useOverdueOrders()
  const openOrder = (o: StoredOrder) => navigate(`/orders/${o.orderId}`)
  const openAll = () => navigate('/stored-orders')
  const handleRetry = () => refetch()
  const rowKey = (o: StoredOrder) => o.orderId
  const rowProps = (o: StoredOrder) => ({
    onClick: () => openOrder(o),
    style: { cursor: 'pointer' },
  })

  const empty = isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được đồ tồn"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={handleRetry}>Thử lại</Button>}
    />
  ) : (
    <EmptyState
      icon={<LuPackageCheck size={32} />}
      title="Không có đồ tồn"
      description="Đơn hoàn thành lâu mà khách chưa lấy sẽ hiện ở đây."
    />
  )

  return (
    <Card>
      <Group justify="space-between" mb="sm">
        <Title order={5}>Đồ tồn cần nhắc</Title>
        <Button variant="subtle" size="xs" onClick={openAll}>
          Xem tất cả
        </Button>
      </Group>
      <DataTable
        columns={COLUMNS}
        data={isError ? [] : (data?.orders ?? []).slice(0, 5)}
        rowKey={rowKey}
        rowProps={rowProps}
        loading={isLoading}
        empty={empty}
      />
    </Card>
  )
}
