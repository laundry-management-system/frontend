import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { formatPhone } from '@/features/customers'
import { UNIT_LABEL } from '@/features/services'
import { invalidateShifts, NoShiftBanner, useCurrentShift } from '@/features/shifts'
import { useMe, useUserName } from '@/features/users'
import { VoucherTag } from '@/features/vouchers'
import { toApiError } from '@/shared/api/apiError'
import { formatDateTime, formatMoney, formatNumber } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { EntityCode, InfoLabel, ModalFooter, OrderCode, StatusBadge } from '@/shared/ui'
import { useApplyOrderVoucher } from '../../application/mutations/useApplyOrderVoucher'
import { CheckoutError, useCheckout } from '../../application/mutations/useCheckout'
import { usePayments } from '../../application/queries/usePayments'
import { useVietQr } from '../../application/queries/useVietQr'
import { deliverySchema, type DeliveryValues } from '../../application/schemas'
import { changeDue, confirmedTxn, PAYMENT_METHOD_KEY } from '../../domain/payment'
import type { CheckoutMode, DeliveryResult, OrderDetail, PaymentTxn } from '../../domain/types'
import { VoucherField } from './VoucherField'
import { InfoSection } from '../InfoRow'
import { PaymentFields, type PaymentValue } from './PaymentFields'

export interface CheckoutDone {
  payment: PaymentTxn | null
  /** `null` khi đã thu tiền nhưng bước trả đồ lỗi */
  delivery: DeliveryResult | null
  cash: { given: number; change: number } | null
}

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

const EMPTY_PAYMENT: PaymentValue = { method: 'CASH', given: '', referenceCode: '' }

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

/** Khách lấy đồ: thu tiền (nếu chưa trả) và trả đồ trong một lần xác nhận. Mount khi mở. */
export function CheckoutModal({
  order,
  mode,
  onClose,
  onDiscrepancy,
  onDone,
}: {
  order: OrderDetail
  mode: CheckoutMode
  onClose: () => void
  onDiscrepancy: () => void
  onDone: (r: CheckoutDone) => void
}) {
  const paying = mode === 'checkout'
  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const shift = useCurrentShift()
  // Thu tiền phải có ca đang mở; chỉ trả đồ (đã thanh toán trước) thì không cần
  const noShift = paying && shift.data?.current === null
  const [payment, setPayment] = useState<PaymentValue>(EMPTY_PAYMENT)
  const qr = useVietQr(order.orderCode, paying && payment.method === 'BANK_TRANSFER')
  const payments = usePayments(order.orderCode)
  const checkout = useCheckout()
  const form = useForm<DeliveryValues>({
    initialValues: { mode: 'SELF', receiverName: '', receiverRelation: '' },
    validate: schemaResolver(deliverySchema, { sync: true }),
  })
  const proxy = form.values.mode === 'PROXY'

  const total = order.totalAmount
  const change = changeDue(total, payment.given)
  const paymentReady = !paying || (payment.method === 'CASH' ? change !== null : !!qr.data)
  const cash =
    paying && payment.method === 'CASH' && change !== null
      ? { given: Number(payment.given), change }
      : null

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
      label: (
        <Group gap={6} wrap="nowrap">
          Giảm giá sự cố
          {order.incidentCodes.map((c) => (
            <EntityCode key={c} code={c} size="sm" />
          ))}
        </Group>
      ),
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

  const submit = form.onSubmit((v) =>
    checkout.mutate(
      {
        order,
        mode,
        method: payment.method,
        referenceCode: payment.referenceCode,
        receiverName: proxy ? v.receiverName.trim() : undefined,
        receiverRelation: proxy ? v.receiverRelation.trim() : undefined,
      },
      {
        onSuccess: (r) => {
          notify.success(paying ? 'Đã thu tiền và trả đồ' : 'Đã trả đồ')
          onDone({ ...r, cash })
          onClose()
        },
        onError: (e) => {
          if (e instanceof CheckoutError) {
            notify.error(`Đã thu tiền, chưa trả đồ được: ${toApiError(e.reason).message}`)
            onDone({ payment: e.payment, delivery: null, cash })
            onClose()
            return
          }
          const err = toApiError(e)
          notify.error(err.message)
          // Ca vừa bị kết ở máy khác: tải lại để hiện cảnh báo Chưa mở ca
          if (err.status === 409) invalidateShifts(queryClient)
          // Lỗi nghiệp vụ: đơn đã được tải lại, đóng để thấy trạng thái mới; lỗi mạng thì giữ dữ liệu đã nhập
          if (err.status) onClose()
        },
      },
    ),
  )

  const orderSummary = (
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
          {formatMoney(total)}
        </Text>
      </Group>
    </Stack>
  )

  // Còn đổi được voucher khi chưa thu tiền, kể cả đơn đã thành 0đ (tự PAID) nhờ voucher
  const voucherEditable = paying || (order.totalAmount === 0 && !!order.voucherCode)
  const applyVoucher = useApplyOrderVoucher()
  const handleVoucherApply = (voucherCode: string | null) =>
    applyVoucher.mutate(
      { orderId: order.id, voucherCode },
      { onError: (e) => notify.error(toApiError(e).message) },
    )
  const voucherSection = voucherEditable && (
    <InfoSection title="Voucher">
      <VoucherField
        key={order.voucherCode ?? ''}
        appliedCode={order.voucherCode}
        subtotal={order.subtotal}
        onApply={handleVoucherApply}
        pending={applyVoucher.isPending || checkout.isPending}
      />
    </InfoSection>
  )

  const paymentSection = (
    <InfoSection title="Thanh toán">
      {noShift && <NoShiftBanner staffName={me?.fullName ?? ''} />}
      {paying ? (
        <PaymentFields
          total={total}
          value={payment}
          onChange={setPayment}
          qr={qr}
          onDiscrepancy={onDiscrepancy}
        />
      ) : order.totalAmount === 0 ? (
        <Text size="sm">Đơn 0đ – voucher đã trừ hết tiền, không cần thu</Text>
      ) : (
        <PaidLine txn={confirmedTxn(payments.data ?? [])} />
      )}
    </InfoSection>
  )

  const receiverSection = (
    <InfoSection title="Người nhận">
      <Radio.Group {...form.getInputProps('mode')}>
        <Group>
          <Radio value="SELF" label="Khách hàng tự nhận" />
          <Radio value="PROXY" label="Người nhận hộ" />
        </Group>
      </Radio.Group>
      {proxy && (
        <>
          <TextInput
            label="Họ tên người nhận"
            required
            maxLength={100}
            {...form.getInputProps('receiverName')}
          />
          <TextInput
            label="Quan hệ với khách"
            required
            maxLength={50}
            {...form.getInputProps('receiverRelation')}
          />
          <Checkbox
            label={
              <InfoLabel info="Chỉ để nhắc, hệ thống không lưu">
                Người nhận đã ký trên liên phiếu giấy
              </InfoLabel>
            }
          />
        </>
      )}
    </InfoSection>
  )

  return (
    <Modal
      opened
      onClose={onClose}
      size={900}
      title={
        <span>
          {paying ? 'Thanh toán & trả đồ' : 'Trả đồ'} <OrderCode code={order.orderCode} />
        </span>
      }
    >
      <form onSubmit={submit} noValidate>
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 5 }}>{orderSummary}</Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              {voucherSection}
              {paymentSection}
              {receiverSection}
            </Stack>
          </Grid.Col>
        </Grid>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button type="submit" disabled={!paymentReady || noShift} loading={checkout.isPending}>
            {paying ? 'Thu tiền & trả đồ' : 'Xác nhận trả đồ'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
