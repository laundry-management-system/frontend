import { Card, Stack, Title } from '@mantine/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuReceiptText } from 'react-icons/lu'
import { formatDate } from '@/shared/lib/format'
import { CopyableCode, DataTable, EmptyState, Money, StatusBadge } from '@/shared/ui'
import { useCustomerOrders } from '../application/useCustomerOrders'
import { ORDER_STATUS_KEY, type CustomerOrder } from '../domain/types'

export function CustomerOrdersCard({ phone }: { phone: string }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useCustomerOrders(phone, page - 1)

  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <Stack>
        <Title order={4}>Lịch sử giao dịch</Title>
        <DataTable<CustomerOrder>
          columns={[
            {
              name: 'code',
              label: 'Mã đơn',
              width: 190,
              render: (o) => <CopyableCode code={o.code} />,
            },
            {
              name: 'receivedAt',
              label: 'Ngày nhận',
              width: 110,
              render: (o) => formatDate(o.receivedAt),
            },
            { name: 'serviceName', label: 'Dịch vụ', render: (o) => o.serviceName ?? '—' },
            {
              name: 'totalAmount',
              label: 'Tổng tiền',
              width: 110,
              align: 'right',
              render: (o) => <Money value={o.totalAmount} />,
            },
            {
              name: 'status',
              label: 'Trạng thái',
              width: 120,
              render: (o) => (
                <StatusBadge group="order" statusKey={ORDER_STATUS_KEY[o.status]} size="sm" />
              ),
            },
          ]}
          data={data?.content ?? []}
          rowKey={(o) => o.id}
          rowProps={(o) => ({
            onClick: () => navigate(`/orders/${o.id}`),
            style: { cursor: 'pointer' },
          })}
          loading={isLoading}
          empty={
            <EmptyState
              icon={<LuReceiptText size={32} />}
              title="Khách chưa có đơn nào"
              description="Đơn của khách sẽ hiện ở đây."
            />
          }
          page={page}
          totalPages={data && data.page.totalPages > 1 ? data.page.totalPages : undefined}
          onPageChange={setPage}
        />
      </Stack>
    </Card>
  )
}
