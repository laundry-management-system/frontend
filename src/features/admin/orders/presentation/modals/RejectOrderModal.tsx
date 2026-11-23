import { Button, Modal, Stack, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { rejectOrderSchema, type RejectOrderValues } from '../../application/schemas'
import { useRejectOrder } from '../../application/mutations/useRejectOrder'
import type { OrderDetail } from '../../domain/types'

/** Từ chối đơn online chờ xác nhận. Mount khi mở. */
export function RejectOrderModal({ order, onClose }: { order: OrderDetail; onClose: () => void }) {
  const reject = useRejectOrder()
  const form = useForm<RejectOrderValues>({
    initialValues: { customerReason: '', reason: '' },
    validate: schemaResolver(rejectOrderSchema, { sync: true }),
    validateInputOnChange: true,
  })
  const valid = rejectOrderSchema.safeParse(form.values).success

  const submit = form.onSubmit((values) =>
    reject.mutate(
      { orderId: order.id, ...values },
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
          <Textarea
            label="Lý do gửi khách"
            required
            autosize
            minRows={2}
            data-autofocus
            {...form.getInputProps('customerReason')}
          />
          <Textarea
            label="Lý do nội bộ (không hiện cho khách)"
            autosize
            minRows={2}
            {...form.getInputProps('reason')}
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
