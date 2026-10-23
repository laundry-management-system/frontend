import { Card, Divider, Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { formatMoney } from '@/shared/lib/format'
import { Money } from '@/shared/ui'
import type { Totals } from '../../domain/types'

function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text fw={strong ? 700 : undefined}>{label}</Text>
      <Text fw={strong ? 700 : undefined}>{value}</Text>
    </Group>
  )
}

export function TotalsCard({
  totals,
  voucherCode,
}: {
  totals: Totals
  voucherCode?: string | null
}) {
  return (
    <Card>
      <Stack gap="xs">
        <Title order={5}>Tổng tiền</Title>
        <Row label="Tổng tiền hàng" value={<Money value={totals.subtotal} />} />
        <Row
          label={voucherCode ? `Giảm giá (${voucherCode})` : 'Giảm giá'}
          value={totals.discount ? `−${formatMoney(totals.discount)}` : formatMoney(0)}
        />
        <Row label="Phụ phí giặt nhanh" value={<Money value={totals.expressFee} />} />
        {totals.whitesFee > 0 && (
          <Row label="Giặt riêng đồ trắng" value={<Money value={totals.whitesFee} />} />
        )}
        <Divider />
        <Row label="Tổng thanh toán" value={<Money value={totals.total} />} strong />
      </Stack>
    </Card>
  )
}
