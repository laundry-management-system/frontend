import { Alert, Autocomplete, Button, Checkbox, Modal, Stack, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { InfoLabel, ModalFooter, Money, OrderCode } from '@/shared/admin/ui'
import { cancelOrderSchema, type CancelOrderValues } from '../../application/schemas'
import { useCancelOrder } from '../../application/mutations/useCancelOrder'
import type { OrderDetail } from '../../domain/types'

// BE nhận lý do dạng chữ tự do (handoff 008 #13)
const REASONS = ['Khách đổi ý', 'Khách không gửi nữa', 'Nhập nhầm đơn', 'Khác']

/** WF-D05: chỉ mở khi đơn còn Mới nhận (`canCancel`). Mount khi mở. */
export function CancelOrderModal({ order, onClose }: { order: OrderDetail; onClose: () => void }) {
  const paid = order.paymentStatus === 'PAID'
  const online = order.channel === 'ONLINE'
  const cancel = useCancelOrder()
  const form = useForm<CancelOrderValues>({
    initialValues: { reason: '', customerReason: '', refunded: false },
    validate: schemaResolver(cancelOrderSchema(paid, online), { sync: true }),
    validateInputOnChange: true,
  })
  const valid = cancelOrderSchema(paid, online).safeParse(form.values).success

  const submit = form.onSubmit((values) =>
    cancel.mutate(
      { orderId: order.id, reason: values.reason, customerReason: values.customerReason },
      {
        onSuccess: () => {
          notify.success('Đã hủy đơn')
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
        <InfoLabel info="Chỉ hủy được khi đơn còn ở trạng thái Mới nhận">
          <span>
            Hủy đơn <OrderCode code={order.orderCode} />?
          </span>
        </InfoLabel>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          {paid && (
            <Alert
              color="warning"
              title={
                <>
                  Đơn đã thanh toán trước <Money value={order.payableAmount} />
                </>
              }
            >
              Ghi nhận hoàn tiền ở màn Thanh toán.
            </Alert>
          )}
          {online ? (
            <>
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
            </>
          ) : (
            <Autocomplete
              label="Lý do hủy"
              required
              data-autofocus
              placeholder="Chọn hoặc nhập lý do"
              data={REASONS}
              {...form.getInputProps('reason')}
            />
          )}
          {paid && (
            <Checkbox
              label="Đã hoàn tiền cho khách"
              {...form.getInputProps('refunded', { type: 'checkbox' })}
            />
          )}
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" color="danger" disabled={!valid} loading={cancel.isPending}>
              Hủy đơn
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
