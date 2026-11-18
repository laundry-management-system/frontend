import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ConfirmModal, EntityCode } from '@/shared/admin/ui'
import { useChangeVoucherStatus } from '../application/useChangeVoucherStatus'
import { voucherErrorMessage } from '../domain/rules'
import type { Voucher } from '../domain/types'

interface VoucherStatusModalProps {
  /** Voucher cần đổi; đang bật thì tắt, đang tắt thì bật lại. null: đóng */
  voucher: Voucher | null
  onClose: () => void
}

export function VoucherStatusModal({ voucher, onClose }: VoucherStatusModalProps) {
  const changeStatus = useChangeVoucherStatus()
  const disabling = voucher?.status === 'ACTIVE'

  const confirm = () => {
    if (!voucher) return
    changeStatus.mutate(
      { id: voucher.id, status: disabling ? 'DISABLED' : 'ACTIVE' },
      {
        onSuccess: (v) =>
          notify.success(disabling ? `Đã tắt voucher ${v.code}` : `Đã bật voucher ${v.code}`),
        onError: (err) => {
          const error = toApiError(err)
          if (error.status !== 403) notify.error(voucherErrorMessage(error).message)
        },
        onSettled: onClose,
      },
    )
  }

  return (
    <ConfirmModal
      opened={!!voucher}
      onClose={onClose}
      onConfirm={confirm}
      kind={disabling ? 'destructive' : 'confirm'}
      title={disabling ? 'Tắt voucher' : 'Bật lại voucher'}
      confirmLabel={disabling ? 'Tắt voucher' : 'Bật voucher'}
      loading={changeStatus.isPending}
    >
      {voucher && (
        <>
          <EntityCode code={voucher.code} />{' '}
          {disabling
            ? 'sẽ không áp được cho đơn mới nữa. Có thể bật lại sau.'
            : 'sẽ áp được lại nếu còn hạn và còn lượt.'}
        </>
      )}
    </ConfirmModal>
  )
}
