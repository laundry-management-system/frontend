import { Card, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { formatMoney } from '@/shared/lib/format'
import { StatusBadge } from '@/shared/ui'
import { isUnclassified } from '../../domain/rules'
import type { OrderDetail, PaymentTxn } from '../../domain/types'
import { InfoRow, InfoSection } from '../InfoRow'
import { PaymentHistoryList } from '../payment/PaymentHistoryList'

export function OrderPaymentCard({
  order,
  onResolve,
}: {
  order: OrderDetail
  /** Chỉ truyền cho Admin */
  onResolve?: (p: PaymentTxn) => void
}) {
  const pending = isUnclassified({ ...order, totalItemsCount: order.items.length })
  // Chỉ liệt kê khoản điều chỉnh khác 0; không có thì tổng tiền hàng chính là tổng thanh toán
  const adjustments = [
    { label: 'Giảm giá', value: -order.discountAmount },
    { label: 'Phụ phí giặt nhanh', value: order.expressFee },
    { label: 'Giặt riêng đồ trắng', value: order.whitesFee },
  ].filter((a) => a.value !== 0)
  const signed = (v: number) => (v < 0 ? `−${formatMoney(-v)}` : `+${formatMoney(v)}`)

  const costs = pending ? (
    <InfoRow label="Tổng thanh toán" strong>
      <Text span size="sm" c="dimmed">
        Đang cập nhật
      </Text>
    </InfoRow>
  ) : (
    <>
      {adjustments.length > 0 && (
        <>
          <InfoRow label="Tổng tiền hàng">{formatMoney(order.subtotal)}</InfoRow>
          {adjustments.map((a) => (
            <InfoRow key={a.label} label={a.label}>
              {signed(a.value)}
            </InfoRow>
          ))}
          <Divider />
        </>
      )}
      <InfoRow label="Tổng thanh toán" strong>
        {formatMoney(order.totalAmount)}
      </InfoRow>
    </>
  )

  return (
    <Card>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={5}>Thanh toán</Title>
          {order.status !== 'CANCELLED' && (
            <StatusBadge group="payment" statusKey={order.paymentStatus.toLowerCase()} size="sm" />
          )}
        </Group>

        <InfoSection title="Chi phí">{costs}</InfoSection>

        <InfoSection title="Giao dịch">
          <PaymentHistoryList orderCode={order.orderCode} onResolve={onResolve} />
        </InfoSection>

        {order.note && (
          <InfoSection title="Ghi chú">
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
              {order.note}
            </Text>
          </InfoSection>
        )}
      </Stack>
    </Card>
  )
}
