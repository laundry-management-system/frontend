import { Button, Card, Divider, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import type { ReactNode } from 'react'
import { formatMoney } from '@/shared/lib/format'
import { Money, StatusBadge } from '@/shared/ui'
import { isUnclassified } from '../../domain/rules'
import type { OrderDetail } from '../../domain/types'

function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text fw={strong ? 700 : undefined}>{label}</Text>
      <Text fw={strong ? 700 : undefined}>{value}</Text>
    </Group>
  )
}

export function OrderPaymentCard({ order }: { order: OrderDetail }) {
  const pending = isUnclassified({ ...order, totalItemsCount: order.items.length })
  const show = (v: ReactNode) =>
    pending ? (
      <Text span c="dimmed">
        Đang cập nhật
      </Text>
    ) : (
      v
    )
  return (
    <Card>
      <Stack gap="xs">
        <Title order={5}>Thanh toán</Title>
        <Row label="Tổng tiền hàng" value={show(<Money value={order.subtotal} />)} />
        <Row
          label="Giảm giá"
          value={show(
            order.discountAmount ? `−${formatMoney(order.discountAmount)}` : formatMoney(0),
          )}
        />
        <Row label="Phụ phí giặt nhanh" value={show(<Money value={order.expressFee} />)} />
        {order.whitesFee > 0 && (
          <Row label="Giặt riêng đồ trắng" value={show(<Money value={order.whitesFee} />)} />
        )}
        <Divider />
        <Row label="Tổng thanh toán" value={show(<Money value={order.totalAmount} />)} strong />
        <Group justify="space-between" mt="xs">
          <StatusBadge group="payment" statusKey={order.paymentStatus.toLowerCase()} />
          <Tooltip label="Làm ở màn Thanh toán (sắp có)">
            <Button variant="secondary" size="xs" data-disabled onClick={(e) => e.preventDefault()}>
              Thu tiền
            </Button>
          </Tooltip>
        </Group>
      </Stack>
    </Card>
  )
}
