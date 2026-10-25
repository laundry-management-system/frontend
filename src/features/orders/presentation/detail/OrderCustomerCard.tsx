import { Anchor, Avatar, Card, Group, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { formatPhone } from '@/features/customers'
import { formatDateTime } from '@/shared/lib/format'
import type { OrderDetail } from '../../domain/types'
import { InfoRow, InfoSection } from '../InfoRow'

export function OrderCustomerCard({ order }: { order: OrderDetail }) {
  return (
    <Card>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={5}>Khách hàng</Title>
          <Anchor component={Link} to={`/customers?q=${order.customerPhone}`} size="sm">
            Xem hồ sơ
          </Anchor>
        </Group>

        <Group gap="sm" wrap="nowrap">
          <Avatar name={order.customerName} color="initials" radius="xl" />
          <Stack gap={0}>
            <Text fw={600}>{order.customerName}</Text>
            <Text size="sm" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatPhone(order.customerPhone)}
            </Text>
          </Stack>
        </Group>

        {order.deliveredAt && (
          <InfoSection title="Giao đồ">
            <InfoRow label="Người nhận">
              {order.receiverName ?? 'Chính khách hàng'}
              {order.receiverRelation && (
                <Text span size="sm" c="dimmed">
                  {' '}
                  ({order.receiverRelation})
                </Text>
              )}
            </InfoRow>
            <InfoRow label="Thời điểm giao">
              {formatDateTime(order.deliveredAt).slice(0, 16)}
            </InfoRow>
            <InfoRow label="Người giao">{order.deliveredBy ?? '—'}</InfoRow>
          </InfoSection>
        )}
      </Stack>
    </Card>
  )
}
