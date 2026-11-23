import { Button, Modal, Stack, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { rejectClaimSchema } from '../../application/schemas'
import { useRejectPaymentClaim } from '../../application/mutations/useRejectPaymentClaim'
import type { OrderDetail } from '../../domain/types'

/** FR-048: từ chối báo thanh toán của khách, lý do hiện cho khách. Mount khi mở. */
export function RejectPaymentClaimModal({
  order,
  onClose,
}: {
  order: OrderDetail
  onClose: () => void
}) {
  const reject = useRejectPaymentClaim()
  const form = useForm({
    initialValues: { reason: '' },
    validate: schemaResolver(rejectClaimSchema, { sync: true }),
  })

  const submit = form.onSubmit(({ reason }) =>
    reject.mutate(
      { orderId: order.id, reason },
      {
        onSuccess: () => {
          notify.success('Đã từ chối báo thanh toán')
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
          Từ chối báo thanh toán đơn <OrderCode code={order.orderCode} />?
        </span>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <Textarea
            label="Lý do (hiện cho khách)"
            required
            autosize
            minRows={2}
            maxLength={200}
            placeholder="VD: Chưa thấy tiền về tài khoản"
            data-autofocus
            {...form.getInputProps('reason')}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" color="danger" loading={reject.isPending}>
              Từ chối
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
