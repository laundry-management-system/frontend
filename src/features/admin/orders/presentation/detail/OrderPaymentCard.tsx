import { Card, Divider, Group, Stack, Text, Title } from '@mantine/core'
import { IncidentDiscountLabel } from '../IncidentDiscountLabel'
import { formatMoney } from '@/shared/common/lib/format'
import { VoucherTag } from '@/features/admin/vouchers'
import { StatusBadge } from '@/shared/admin/ui'
import { isUnclassified } from '../../domain/rules'
import type { OrderDetail, PaymentTxn } from '../../domain/types'
import { InfoRow } from '../InfoRow'
import { PaymentHistoryList } from '../payment/PaymentHistoryList'

export function OrderPaymentCard({
  order,
  part,
  onResolve,
}: {
  order: OrderDetail
  /** costs: chi phí (tab Đồ giặt & giá); transactions: giao dịch (tab Thanh toán) */
  part: 'costs' | 'transactions'
  /** Chỉ truyền cho Admin */
  onResolve?: (p: PaymentTxn) => void
}) {
  const pending = isUnclassified({ ...order, totalItemsCount: order.items.length })
  // Chỉ liệt kê khoản điều chỉnh khác 0; không có thì tổng tiền hàng chính là tổng thanh toán
  const discountLabel = order.voucherCode ? (
    <Group gap={6} wrap="nowrap">
      Voucher
      <VoucherTag code={order.voucherCode} />
    </Group>
  ) : (
    'Giảm giá'
  )
  const incidentLabel = <IncidentDiscountLabel codes={order.incidentCodes} />
  const adjustments = [
    { key: 'discount', label: discountLabel, value: -order.discountAmount },
    { key: 'incident', label: incidentLabel, value: -order.incidentDiscount },
    { key: 'express', label: 'Phụ phí giặt nhanh', value: order.expressFee },
    { key: 'whites', label: 'Giặt riêng đồ trắng', value: order.whitesFee },
  ].filter((a) => a.value !== 0)
  const fees = [
    { key: 'pickup', label: 'Phí lấy đồ', value: order.fulfillment?.pickupFee ?? 0 },
    { key: 'delivery', label: 'Phí giao đồ', value: order.fulfillment?.deliveryFee ?? 0 },
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
            <InfoRow key={a.key} label={a.label}>
              {signed(a.value)}
            </InfoRow>
          ))}
          <Divider />
        </>
      )}
      {fees.length > 0 && (
        <>
          <InfoRow label="Tiền dịch vụ">{formatMoney(order.totalAmount)}</InfoRow>
          {fees.map((f) => (
            <InfoRow key={f.key} label={f.label}>
              {signed(f.value)}
            </InfoRow>
          ))}
          <Divider />
        </>
      )}
      <InfoRow label="Phải thu" strong>
        {formatMoney(order.payableAmount)}
      </InfoRow>
    </>
  )

  if (part === 'costs')
    return (
      <Card>
        <Stack gap="lg">
          <Title order={5}>Chi phí</Title>
          {costs}
        </Stack>
      </Card>
    )

  return (
    <Card>
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={5}>Giao dịch</Title>
          {order.status !== 'CANCELLED' && (
            <StatusBadge group="payment" statusKey={order.paymentStatus.toLowerCase()} size="sm" />
          )}
        </Group>
        <PaymentHistoryList
          orderCode={order.orderCode}
          onResolve={onResolve}
          zeroTotal={order.payableAmount === 0}
        />
      </Stack>
    </Card>
  )
}
