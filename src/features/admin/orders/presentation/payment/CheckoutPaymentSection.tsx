import { Group, Stack, Text } from '@mantine/core'
import { NoShiftBanner } from '@/features/admin/shifts'
import { useMe, useUserName } from '@/features/admin/users'
import { formatDateTime } from '@/shared/common/lib/format'
import { StatusBadge } from '@/shared/admin/ui'
import { usePayments } from '../../application/queries/usePayments'
import { confirmedTxn, PAYMENT_METHOD_KEY } from '../../domain/payment'
import type { OrderDetail, PaymentTxn } from '../../domain/types'
import { InfoSection } from '../InfoRow'
import { PaymentFields } from './PaymentFields'
import type { CheckoutState } from './useCheckoutModal'

interface Props {
  order: OrderDetail
  payOnly?: boolean
  checkout: CheckoutState
  onDiscrepancy: () => void
}

function PaidLine({ txn }: { txn: PaymentTxn | null }) {
  const collector = useUserName(txn?.confirmedBy ?? null)
  return (
    <Group gap={6}>
      <StatusBadge group="payment" statusKey="paid" size="sm" />
      {txn && (
        <>
          <StatusBadge
            group="payment-method"
            statusKey={PAYMENT_METHOD_KEY[txn.method]}
            size="sm"
          />
          <Text size="sm" c="dimmed">
            {formatDateTime(txn.paidAt).slice(0, 16)} · {collector}
          </Text>
        </>
      )}
    </Group>
  )
}

export function CheckoutPaymentSection({ order, payOnly, checkout, onDiscrepancy }: Props) {
  const { paying, noShift, payment, setPayment, qr } = checkout
  const { data: me } = useMe()
  const payments = usePayments(order.orderCode)

  const paymentBody = (
    <>
      {noShift && <NoShiftBanner staffName={me?.fullName ?? ''} />}
      {paying ? (
        <PaymentFields
          total={order.payableAmount}
          value={payment}
          onChange={setPayment}
          qr={qr}
          onDiscrepancy={onDiscrepancy}
          transferOnly={payOnly}
          compactTransfer={payOnly}
        />
      ) : order.payableAmount === 0 ? (
        <Text size="sm">Đơn 0đ – voucher đã trừ hết tiền, không cần thu</Text>
      ) : (
        <PaidLine txn={confirmedTxn(payments.data ?? [])} />
      )}
    </>
  )
  return payOnly ? (
    <Stack gap="sm">{paymentBody}</Stack>
  ) : (
    <InfoSection title="Thanh toán">{paymentBody}</InfoSection>
  )
}
