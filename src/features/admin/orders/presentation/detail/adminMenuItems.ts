import type { RowAction } from '@/shared/admin/ui'
import { adminActionsOf, preReceiptLockReason } from '../../domain/rules'
import type { OrderDetail } from '../../domain/types'

export type AdminAction = 'reschedule' | 'price' | 'revert' | 'cancel' | 'undoDelivery'

const ACTIONS: { key: Exclude<AdminAction, 'cancel'>; label: string }[] = [
  { key: 'reschedule', label: 'Sửa ngày hẹn trả' },
  { key: 'price', label: 'Sửa đơn giá / tổng tiền' },
  { key: 'undoDelivery', label: 'Hoàn tác Đang giao' },
  { key: 'revert', label: 'Lùi trạng thái' },
]

/** Thao tác Admin áp dụng được cho đơn; menu ⋯ và AdminReasonModal cùng dùng để ẩn thao tác không hợp lệ. */
export function allowedAdminActions(order: OrderDetail): Exclude<AdminAction, 'cancel'>[] {
  const available = adminActionsOf(order)
  const locked = !!preReceiptLockReason(order)
  const classified = order.items.length > 0
  return ACTIONS.map((a) => a.key).filter(
    (key) =>
      available[key].enabled &&
      !(locked && (key === 'reschedule' || key === 'price')) &&
      !(key === 'price' && !classified),
  )
}

/** Mục Admin trong menu ⋯ của header. Hủy đơn là nút riêng ở header. */
export function adminMenuItems({
  order,
  onAction,
}: {
  order: OrderDetail
  onAction: (action: AdminAction) => void
}): RowAction[] {
  const allowed = allowedAdminActions(order)
  return ACTIONS.map(({ key, label }) => ({
    label,
    hidden: !allowed.includes(key),
    onClick: () => onAction(key),
  }))
}
