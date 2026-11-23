import { Button, Modal, Stack } from '@mantine/core'
import { toApiError } from '@/shared/common/api/apiError'
import { formatDateTime, formatPhone } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { ModalFooter, OrderCode } from '@/shared/admin/ui'
import { useConfirmOrder } from '../../application/mutations/useConfirmOrder'
import { DROPOFF_METHOD_LABEL, RETURN_METHOD_LABEL, type OrderDetail } from '../../domain/types'
import { InfoRow } from '../InfoRow'

/** Xác nhận đơn online chờ xác nhận. Mount khi mở; lỗi "đã được xử lý" thì đóng, tải lại qua invalidate. */
export function ConfirmOnlineOrderModal({
  order,
  onClose,
}: {
  order: OrderDetail
  onClose: () => void
}) {
  const confirm = useConfirmOrder()
  const f = order.fulfillment

  const submit = () =>
    confirm.mutate(order.id, {
      onSuccess: () => {
        notify.success('Đã xác nhận đơn')
        onClose()
      },
      onError: (e) => {
        notify.error(toApiError(e).message)
        onClose()
      },
    })

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <span>
          Xác nhận đơn <OrderCode code={order.orderCode} />?
        </span>
      }
    >
      <Stack>
        <InfoRow label="Khách">
          {order.customerName} · {formatPhone(order.customerPhone)}
        </InfoRow>
        {f && (
          <>
            <InfoRow label="Hình thức gửi">{DROPOFF_METHOD_LABEL[f.dropoffMethod]}</InfoRow>
            <InfoRow label="Hình thức nhận">{RETURN_METHOD_LABEL[f.returnMethod]}</InfoRow>
            {f.appointmentAt && (
              <InfoRow label="Giờ hẹn">{formatDateTime(f.appointmentAt).slice(0, 16)}</InfoRow>
            )}
          </>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Quay lại
          </Button>
          <Button loading={confirm.isPending} onClick={submit}>
            Xác nhận
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  )
}
