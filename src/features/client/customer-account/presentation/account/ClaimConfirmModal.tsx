import { Modal } from '@mantine/core'
import { formatMoney } from '@/shared/common/lib/format'
import { useClaimMyOrderPayment } from '../../application/mutations/useMyOrderPaymentActions'

interface Props {
  orderCode: string
  amount: number
  opened: boolean
  onClose: () => void
}

export function ClaimConfirmModal({ orderCode, amount, opened, onClose }: Props) {
  const claim = useClaimMyOrderPayment(orderCode)
  const confirmClaim = () => claim.mutate(undefined, { onSettled: onClose })
  return (
    <Modal opened={opened} onClose={onClose} title="Xác nhận đã thanh toán" centered>
      <div data-surface="public" data-surface-bg="none" className="grid gap-4">
        <p>Bạn đã chuyển khoản {formatMoney(amount)}? Sau khi báo, không thể đổi voucher.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="pub-btn pub-btn--ghost">
            Chưa
          </button>
          <button
            type="button"
            disabled={claim.isPending}
            onClick={confirmClaim}
            className="pub-btn pub-btn--primary disabled:opacity-60"
          >
            {claim.isPending ? 'Đang gửi…' : 'Đã chuyển khoản'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
