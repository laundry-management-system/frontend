import { ColorSwatch, Group, RingProgress, Stack, Text } from '@mantine/core'
import { LuWallet } from 'react-icons/lu'
import { EmptyState, Money } from '@/shared/admin/ui'
import { paymentShare } from '../domain/dashboard'
import type { RevenueSummary } from '../domain/types'
import { BANK_COLOR, CASH_COLOR } from './paymentColors'

interface PaymentSplitProps {
  summary: RevenueSummary
}

export function PaymentSplit({ summary }: PaymentSplitProps) {
  const share = paymentShare(summary)
  if (!share)
    return (
      <EmptyState
        icon={<LuWallet size={32} />}
        title="Chưa có thanh toán"
        description="Tỉ lệ tiền mặt / chuyển khoản trong kỳ sẽ hiện ở đây."
      />
    )

  const sections = [
    { value: share.cashPct, color: CASH_COLOR, tooltip: `Tiền mặt ${share.cashPct}%` },
    { value: share.bankPct, color: BANK_COLOR, tooltip: `Chuyển khoản ${share.bankPct}%` },
  ]

  return (
    <Group gap="lg" wrap="nowrap">
      <RingProgress size={140} thickness={16} sections={sections} />
      <Stack gap="xs">
        <div>
          <Group gap={6}>
            <ColorSwatch color={CASH_COLOR} size={10} withShadow={false} />
            <Text size="sm" c="dimmed">
              Tiền mặt {share.cashPct}%
            </Text>
          </Group>
          <Money value={summary.cash} />
        </div>
        <div>
          <Group gap={6}>
            <ColorSwatch color={BANK_COLOR} size={10} withShadow={false} />
            <Text size="sm" c="dimmed">
              Chuyển khoản {share.bankPct}%
            </Text>
          </Group>
          <Money value={summary.bankTransfer} />
        </div>
      </Stack>
    </Group>
  )
}
