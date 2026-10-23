import { Anchor, Card, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { formatPhone } from '@/features/customers'
import type { OrderDetail } from '../../domain/types'

export function OrderCustomerCard({ order }: { order: OrderDetail }) {
  return (
    <Card>
      <Stack gap={6}>
        <Title order={5}>Khách hàng</Title>
        <Text fw={600}>{order.customerName}</Text>
        <Text c="dimmed">{formatPhone(order.customerPhone)}</Text>
        <Anchor component={Link} to={`/customers?q=${order.customerPhone}`} size="sm">
          Xem hồ sơ khách
        </Anchor>
        <Text size="sm" c="dimmed">
          Người nhận hộ:{' '}
          {order.receiverName ? `${order.receiverName} (${order.receiverRelation ?? '—'})` : '—'}
        </Text>
      </Stack>
    </Card>
  )
}
