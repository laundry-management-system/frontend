import { Button, Modal, Select, Stack, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { rejectOrderSchema, type RejectOrderValues } from '../../application/schemas'
import { useRejectOrder } from '../../application/mutations/useRejectOrder'
import { CANCEL_REASONS, type CancelReasonCode } from '../../domain/cancelReasons'
import type { OrderDetail } from '../../domain/types'

const REASON_OPTIONS = CANCEL_REASONS.map((r) => ({ value: r.code, label: r.label }))

/** Từ chối đơn online chờ xác nhận. Mount khi mở. */
export function RejectOrderModal({ order, onClose }: { order: OrderDetail; onClose: () => void }) {
  const reject = useRejectOrder()
  const form = useForm<RejectOrderValues>({
    initialValues: { reasonCode: '', customerReason: '', reason: '' },
    validate: schemaResolver(rejectOrderSchema, { sync: true }),
    validateInputOnChange: true,
  })
  const valid = rejectOrderSchema.safeParse(form.values).success

  const submit = form.onSubmit((values) =>
    reject.mutate(
      { orderId: order.id, ...values, reasonCode: values.reasonCode as CancelReasonCode },
      {
        onSuccess: () => {
          notify.success('Đã từ chối đơn')
          onClose()
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    ),
  )

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <span>
          Từ chối đơn <OrderCode code={order.orderCode} />?
        </span>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <Select
            label="Lý do hủy"
            required
            data-autofocus
            placeholder="Chọn lý do"
            data={REASON_OPTIONS}
            {...form.getInputProps('reasonCode')}
          />
          {form.values.reasonCode === 'OTHER' && (
            <Textarea
              label="Lý do hủy khác"
              required
              maxLength={500}
              autosize
              minRows={2}
              {...form.getInputProps('reason')}
            />
          )}
          <Textarea
            label="Lý do gửi khách"
            required
            autosize
            minRows={2}
            {...form.getInputProps('customerReason')}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" color="danger" disabled={!valid} loading={reject.isPending}>
              Từ chối đơn
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
