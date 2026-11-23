import { Divider, Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { UNIT_LABEL } from '@/features/admin/services'
import { VoucherTag } from '@/features/admin/vouchers'
import { formatMoney, formatNumber, formatPhone } from '@/shared/common/lib/format'
import { IncidentDiscountLabel } from '../IncidentDiscountLabel'
import type { OrderDetail } from '../../domain/types'

const SUMMARY_BOX = { borderRadius: 'var(--radius-md)' }
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

function SummaryRow({ label, hint, value }: { label: ReactNode; hint?: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
      <Stack gap={0}>
        <Text size="sm" component="div">
          {label}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed" style={TABULAR}>
            {hint}
          </Text>
        )}
      </Stack>
      <Text size="sm" fw={500} style={TABULAR}>
        {value}
      </Text>
    </Group>
  )
}

export function CheckoutOrderSummary({ order }: { order: OrderDetail }) {
  const adjustments = [
    {
      key: 'discount',
      label: order.voucherCode ? (
        <Group gap={6} wrap="nowrap">
          Giảm giá
          <VoucherTag code={order.voucherCode} />
        </Group>
      ) : (
        'Giảm giá'
      ),
      value: -order.discountAmount,
    },
    {
      key: 'incident',
      label: <IncidentDiscountLabel codes={order.incidentCodes} />,
      value: -order.incidentDiscount,
    },
    { key: 'express', label: 'Phụ phí giặt nhanh', value: order.expressFee },
    { key: 'whites', label: 'Giặt riêng đồ trắng', value: order.whitesFee },
  ]
    .filter((a) => a.value !== 0)
    .map((a) => (
      <SummaryRow
        key={a.key}
        label={a.label}
        value={a.value < 0 ? `−${formatMoney(-a.value)}` : `+${formatMoney(a.value)}`}
      />
    ))

  return (
    <Stack gap="sm" p="md" bg="var(--ds-muted)" style={SUMMARY_BOX}>
      <Stack gap={0}>
        <Text fw={600}>{order.customerName}</Text>
        <Text size="sm" c="dimmed">
          {formatPhone(order.customerPhone)}
        </Text>
      </Stack>
      <Divider />
      {order.items.map((line, i) => {
        const qty = line.billableQuantity ?? Number(line.quantity)
        return (
          <SummaryRow
            key={line.id ?? i}
            label={line.itemType}
            hint={`${formatNumber(qty)} ${UNIT_LABEL[line.unit]} × ${formatMoney(line.unitPrice)}`}
            value={formatMoney(Math.round(line.unitPrice * qty))}
          />
        )
      })}
      {adjustments}
      <Divider />
      <Group justify="space-between" wrap="nowrap">
        <Text fw={700}>Tổng thanh toán</Text>
        <Text fw={700} size="lg" style={TABULAR}>
          {formatMoney(order.payableAmount)}
        </Text>
      </Group>
    </Stack>
  )
}
