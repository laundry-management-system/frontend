import { Button, Group, Modal, SegmentedControl, Stack, Text, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { formatDateTime } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, Money, StatusBadge } from '@/shared/ui'
import { useResolvePayment } from '../../application/mutations/useResolvePayment'
import { resolutionSchema, type ResolutionValues } from '../../application/schemas'
import { PAYMENT_METHOD_KEY } from '../../domain/payment'
import type { OrderDetail, PaymentResolution, PaymentTxn } from '../../domain/types'

const REASON_MAX = 255

const RESOLUTIONS = [
  { value: 'VOIDED', label: 'Hủy xác nhận nhầm' },
  { value: 'REFUNDED', label: 'Ghi nhận hoàn tiền' },
]

const RESULT_LABEL: Record<PaymentResolution, string> = {
  VOIDED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
}

/** Chỉ Admin. Mount khi mở. */
export function ResolvePaymentModal({
  order,
  payment,
  onClose,
}: {
  order: OrderDetail
  payment: PaymentTxn
  onClose: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const resolve = useResolvePayment()
  const form = useForm<ResolutionValues>({
    initialValues: { resolution: 'VOIDED', reason: '' },
    validate: schemaResolver(resolutionSchema, { sync: true }),
    validateInputOnChange: true,
  })
  const { resolution, reason } = form.values

  const askConfirm = form.onSubmit(() => setConfirming(true))
  const closeConfirm = () => setConfirming(false)
  const submit = () =>
    resolve.mutate(
      { orderCode: order.orderCode, paymentId: payment.id, resolution, reason },
      {
        onSuccess: () => {
          notify.success(
            resolution === 'VOIDED' ? 'Đã hủy xác nhận thanh toán' : 'Đã ghi nhận hoàn tiền',
          )
          onClose()
        },
        onError: (e) => {
          notify.error(toApiError(e).message)
          setConfirming(false)
        },
      },
    )

  return (
    <>
      <Modal
        opened={!confirming}
        onClose={onClose}
        title={
          <InfoLabel info="Thao tác được ghi nhật ký hệ thống">Hủy xác nhận / hoàn tiền</InfoLabel>
        }
      >
        <form onSubmit={askConfirm} noValidate>
          <Stack>
            <Group justify="space-between">
              <EntityCode code={payment.invoiceNo} />
              <Text fw={600}>
                <Money value={payment.amount} />
              </Text>
            </Group>
            <Group gap="xs">
              <StatusBadge
                group="payment-method"
                statusKey={PAYMENT_METHOD_KEY[payment.method]}
                size="sm"
              />
              <Text size="sm" c="dimmed">
                {formatDateTime(payment.paidAt).slice(0, 16)}
              </Text>
            </Group>
            <SegmentedControl fullWidth data={RESOLUTIONS} {...form.getInputProps('resolution')} />
            <Textarea
              label="Lý do"
              required
              data-autofocus
              autosize
              minRows={2}
              maxLength={REASON_MAX}
              description={`${reason.length}/${REASON_MAX}`}
              {...form.getInputProps('reason')}
            />
            <ModalFooter>
              <Button variant="secondary" onClick={onClose}>
                Quay lại
              </Button>
              <Button type="submit" color="danger">
                Tiếp tục
              </Button>
            </ModalFooter>
          </Stack>
        </form>
      </Modal>
      <ConfirmModal
        opened={confirming}
        onClose={closeConfirm}
        onConfirm={submit}
        kind="destructive"
        title="Xác nhận thao tác?"
        loading={resolve.isPending}
      >
        Giao dịch sẽ chuyển sang “{RESULT_LABEL[resolution]}”, đơn trở về Chưa thanh toán.
      </ConfirmModal>
    </>
  )
}
