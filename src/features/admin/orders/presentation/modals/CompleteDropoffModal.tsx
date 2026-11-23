import { z } from 'zod'
import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { trackingCodeField } from '../../application/schemas'
import { useCompleteDropoff } from '../../application/mutations/useCompleteDropoff'
import type { OrderDetail } from '../../domain/types'

const schema = (pickup: boolean) =>
  z.object({ pickupTrackingCode: pickup ? trackingCodeField : z.string() })

/** Chốt chiều gửi: khách tới đưa đồ / đã lấy đồ từ khách. Mount khi mở. */
export function CompleteDropoffModal({
  order,
  onClose,
}: {
  order: OrderDetail
  onClose: () => void
}) {
  const complete = useCompleteDropoff()
  const pickup = order.fulfillment?.dropoffMethod === 'PICKUP'
  const label = pickup ? 'Đã lấy đồ từ khách' : 'Khách đã tới đưa đồ'
  const form = useForm({
    initialValues: { pickupTrackingCode: order.fulfillment?.pickupTrackingCode ?? '' },
    validate: schemaResolver(schema(pickup), { sync: true }),
  })

  const submit = form.onSubmit((v) =>
    complete.mutate(
      { orderId: order.id, pickupTrackingCode: pickup ? v.pickupTrackingCode : undefined },
      {
        onSuccess: () => {
          notify.success('Đã nhận đồ, đơn chuyển sang Mới nhận')
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
          {label} · <OrderCode code={order.orderCode} />
        </span>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          {pickup && (
            <TextInput
              label="Mã vận đơn chặng lấy"
              data-autofocus
              {...form.getInputProps('pickupTrackingCode')}
            />
          )}
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" loading={complete.isPending}>
              {label}
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
