import type { ReactNode } from 'react'
import { Box, Button, Divider, Group, Loader, Paper, Stack, Text } from '@mantine/core'
import { LuCloudOff, LuReceiptText } from 'react-icons/lu'
import { useUserName } from '@/features/admin/users'
import { formatDateTime } from '@/shared/common/lib/format'
import {
  CopyableCode,
  EmptyState,
  FieldGrid,
  Money,
  RowActions,
  StatusBadge,
} from '@/shared/admin/ui'
import { usePayments } from '../../application/queries/usePayments'
import { PAYMENT_METHOD_KEY, PAYMENT_TXN_KEY } from '../../domain/payment'
import type { PaymentTxn } from '../../domain/types'

const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

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
          <RowActions items={actions} />
        </Group>
        <FieldGrid
          rows={[
            ['Thời gian', dateTime(txn.paidAt)],
            ['Người ghi nhận', <UserName key="by" id={txn.confirmedBy} />],
            ['Mã tham chiếu', txn.referenceCode],
            ['Mã hoá đơn', <CopyableCode key="inv" code={txn.invoiceNo} size="sm" />],
            ...(active
              ? []
              : ([
                  ['Lý do', txn.voidReason],
                  ['Người hủy', txn.voidedBy ? <UserName key="vby" id={txn.voidedBy} /> : ''],
                  ['Hủy lúc', txn.voidedAt ? dateTime(txn.voidedAt) : ''],
                ] as [string, ReactNode][])),
          ]}
        />
        <Divider mt={4} />
        {/* gap 6 + pt 6 = 12px, bằng padding dưới của thẻ (p=sm) */}
        <Box pt={6}>
          <FieldGrid
            rows={[
              [
                'Số tiền',
                <Text
                  key="amount"
                  fw={700}
                  td={active ? undefined : 'line-through'}
                  component="span"
                >
                  <Money value={txn.amount} />
                </Text>,
              ],
            ]}
          />
        </Box>
      </Stack>
    </Paper>
  )
}

export function PaymentHistoryList({
  orderCode,
  onResolve,
  zeroTotal = false,
}: {
  orderCode: string
  onResolve?: (p: PaymentTxn) => void
  /** Voucher trừ hết tiền: đơn tự đã thanh toán, không có giao dịch */
  zeroTotal?: boolean
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
  if (!data?.length && zeroTotal)
    return (
      <EmptyState
        icon={<LuReceiptText size={32} />}
        title="Đơn 0đ"
        description="Voucher đã trừ hết tiền, không cần thu."
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
