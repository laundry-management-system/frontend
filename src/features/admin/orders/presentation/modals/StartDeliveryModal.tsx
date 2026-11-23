import { Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { trackingCodesSchema, type TrackingCodesValues } from '../../application/schemas'
import { useStartDelivery } from '../../application/mutations/useStartDelivery'
import type { OrderDetail } from '../../domain/types'

/** Bắt đầu giao đơn online giao tận nơi; mã vận đơn chặng giao tùy chọn. Mount khi mở. */
export function StartDeliveryModal({
  order,
  onClose,
  onStarted,
}: {
  order: OrderDetail
  onClose: () => void
  onStarted?: () => void
}) {
  const start = useStartDelivery()
  const form = useForm<TrackingCodesValues>({
    initialValues: {
      pickupTrackingCode: '',
      deliveryTrackingCode: order.fulfillment?.deliveryTrackingCode ?? '',
    },
    validate: schemaResolver(trackingCodesSchema, { sync: true }),
  })

  const submit = form.onSubmit((v) =>
    start.mutate(
      { orderId: order.id, deliveryTrackingCode: v.deliveryTrackingCode },
      {
        onSuccess: () => {
          notify.success('Đơn đang được giao')
          onClose()
          onStarted?.()
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
          Bắt đầu giao · <OrderCode code={order.orderCode} />
        </span>
      }
    >
      <form onSubmit={submit} noValidate>
        <Stack>
          <Text size="sm">Hoá đơn sẽ được in.</Text>
          <TextInput
            label="Mã vận đơn chặng giao"
            data-autofocus
            {...form.getInputProps('deliveryTrackingCode')}
          />
          <ModalFooter>
            <Button variant="secondary" onClick={onClose}>
              Quay lại
            </Button>
            <Button type="submit" loading={start.isPending}>
              Bắt đầu giao & in hoá đơn
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  )
}
