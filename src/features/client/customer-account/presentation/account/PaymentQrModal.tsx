import { Modal, Skeleton } from '@mantine/core'
import { useMyOrder } from '../../application/queries/useMyOrder'
import { usePaymentQr } from '../../application/queries/usePaymentQr'
import { Breakdown } from './PaymentBreakdown'
import { UnpaidBody } from './UnpaidBody'

interface Props {
  orderCode: string
  opened: boolean
  onClose: () => void
}

export function PaymentQrModal({ orderCode, opened, onClose }: Props) {
  const order = useMyOrder(orderCode)
  const paid = order.data?.paymentStatus === 'PAID' || order.data?.money.payableAmount === 0
  const qr = usePaymentQr(orderCode, opened && !!order.data && !paid)
  const { data, isPending, isError, refetch } = qr

  let body
  if (order.data && paid) {
    body = (
      <div className="grid justify-items-center gap-4 text-(length:--pub-text-md)">
        <Breakdown order={order.data} />
        <p role="status" className="font-semibold text-(--pub-accent-ink)">
          Đã thanh toán
        </p>
      </div>
    )
  } else if (data && order.data) {
    body = <UnpaidBody order={order.data} qr={data} />
  } else if (isError || order.isError) {
    body = (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p>Không tải được mã QR. Vui lòng thử lại.</p>
        <button
          type="button"
          onClick={() => {
            void order.refetch()
            void refetch()
          }}
          className="pub-btn pub-btn--ghost"
        >
          Thử lại
        </button>
      </div>
    )
  } else if (isPending) {
    body = <Skeleton h={320} radius="md" aria-label="Đang tải mã QR" />
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Thanh toán đơn ${orderCode}`}
      centered
      closeOnEscape
    >
      <div data-surface="public" data-surface-bg="none">
        {body}
      </div>
    </Modal>
  )
}
