import { Button, Group, Loader, Paper, Stack, Text } from '@mantine/core'
import { LuCloudOff, LuReceiptText } from 'react-icons/lu'
import { useUserName } from '@/features/users'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { EmptyState, EntityCode, RowActions, StatusBadge } from '@/shared/ui'
import { usePayments } from '../../application/queries/usePayments'
import { PAYMENT_METHOD_KEY, PAYMENT_TXN_KEY } from '../../domain/payment'
import type { PaymentTxn } from '../../domain/types'

const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

function UserName({ id }: { id: number | null }) {
  return <>{useUserName(id)}</>
}

function PaymentRow({ txn, onResolve }: { txn: PaymentTxn; onResolve?: (p: PaymentTxn) => void }) {
  const resolve = () => onResolve?.(txn)
  const actions = [
    {
      label: 'Hủy xác nhận / hoàn tiền',
      danger: true,
      hidden: !onResolve || txn.status !== 'CONFIRMED',
      onClick: resolve,
    },
  ]
  const active = txn.status === 'CONFIRMED'
  return (
    <Paper withBorder radius="md" p="sm" opacity={active ? 1 : 0.75}>
      <Stack gap={6}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap={6}>
            <StatusBadge
              group="payment-method"
              statusKey={PAYMENT_METHOD_KEY[txn.method]}
              size="sm"
            />
            {!active && (
              <StatusBadge group="payment-txn" statusKey={PAYMENT_TXN_KEY[txn.status]} size="sm" />
            )}
          </Group>
          <Group gap={2} wrap="nowrap">
            <Text fw={600} td={active ? undefined : 'line-through'} style={TABULAR}>
              {formatMoney(txn.amount)}
            </Text>
            <RowActions items={actions} />
          </Group>
        </Group>
        <Text size="xs" c="dimmed">
          {dateTime(txn.paidAt)} · <UserName id={txn.confirmedBy} />
          {txn.referenceCode && <> · Mã tham chiếu {txn.referenceCode}</>}
        </Text>
        <EntityCode code={txn.invoiceNo} size="sm" />
        {!active && (
          <Text size="xs" c="dimmed">
            Lý do: {txn.voidReason ?? '—'} · <UserName id={txn.voidedBy} />
            {txn.voidedAt && ` · ${dateTime(txn.voidedAt)}`}
          </Text>
        )}
      </Stack>
    </Paper>
  )
}

export function PaymentHistoryList({
  orderCode,
  onResolve,
}: {
  orderCode: string
  onResolve?: (p: PaymentTxn) => void
}) {
  const { data, isLoading, isError, refetch } = usePayments(orderCode)
  const handleRetry = () => refetch()

  if (isLoading) return <Loader size="sm" />
  if (isError)
    return (
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được giao dịch"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={
          <Button variant="secondary" size="xs" onClick={handleRetry}>
            Thử lại
          </Button>
        }
      />
    )
  if (!data?.length)
    return (
      <EmptyState
        icon={<LuReceiptText size={32} />}
        title="Chưa có giao dịch"
        description="Các lần thu tiền của đơn sẽ hiện ở đây."
      />
    )
  return (
    <Stack gap="xs">
      {data.map((txn) => (
        <PaymentRow key={txn.id} txn={txn} onResolve={onResolve} />
      ))}
    </Stack>
  )
}
