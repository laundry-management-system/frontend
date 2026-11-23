import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ConfirmModal, OrderCode } from '@/shared/admin/ui'
import { useDeliverOrder } from '../../application/mutations/useDeliverOrder'
import type { OrderDetail } from '../../domain/types'

/** Đơn online giao tận nơi, đã thanh toán, khách chưa tự xác nhận: nhân viên hoàn tất thay khách. Mount khi mở. */
export function CompleteOnBehalfModal({
  order,
  onClose,
}: {
  order: OrderDetail
  onClose: () => void
}) {
  const deliver = useDeliverOrder()

  const confirm = () =>
    deliver.mutate(order, {
      onSuccess: () => {
        notify.success('Đã hoàn tất đơn')
        onClose()
      },
      onError: (e) => notify.error(toApiError(e).message),
    })

  return (
    <ConfirmModal
      opened
      onClose={onClose}
      onConfirm={confirm}
      kind="confirm"
      title={
        <span>
          Hoàn tất đơn thay khách · <OrderCode code={order.orderCode} />
        </span>
      }
      confirmLabel="Hoàn tất đơn"
      loading={deliver.isPending}
    >
      Đơn chuyển sang Đã giao.
    </ConfirmModal>
  )
}
