import type { AuditAction, AuditLogSummary, EntityType } from './types'

export const ACTION_LABEL: Record<AuditAction, string> = {
  ACCOUNT_MANAGE: 'Quản lý tài khoản',
  ACCOUNT_LOCKED: 'Khóa tài khoản',
  CUSTOMER_PHONE_CHANGE: 'Đổi SĐT khách',
  DUE_DATE_CHANGE: 'Sửa ngày hẹn trả',
  INCIDENT_APPROVE: 'Duyệt sự cố',
  MACHINE_STATUS: 'Đổi trạng thái máy',
  ORDER_PRICE_EDIT: 'Sửa giá đơn',
  PAYMENT_CONFIRM: 'Xác nhận thanh toán',
  PAYMENT_VOID: 'Hủy thanh toán',
  PAYMENT_REFUND: 'Hoàn tiền',
  PRICE_CHANGE: 'Đổi giá dịch vụ',
  SET_UP_PASSWORD: 'Thiết lập mật khẩu',
  STATUS_ROLLBACK: 'Lùi trạng thái',
  SETTING_UPDATED: 'Đổi cài đặt',
}

export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  AUTH: 'Xác thực',
  USER: 'Tài khoản',
  CUSTOMER: 'Khách hàng',
  ORDER: 'Đơn hàng',
  PAYMENT: 'Thanh toán',
  SERVICE: 'Dịch vụ',
  SETTING: 'Tham số',
}

export const AUDIT_ACTIONS = Object.keys(ACTION_LABEL) as AuditAction[]
export const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABEL) as EntityType[]

export const actionLabel = (code: string) => ACTION_LABEL[code as AuditAction] ?? code
export const entityTypeLabel = (code: string) => ENTITY_TYPE_LABEL[code as EntityType] ?? code

/** Tài khoản seed id 0 là các tác vụ hệ thống tự chạy */
export const actorName = (log: Pick<AuditLogSummary, 'userId' | 'fullName' | 'username'>) =>
  log.userId === 0 ? 'Hệ thống' : (log.fullName ?? log.username ?? `#${log.userId}`)

/** Với SETTING, entityId là số thứ tự enum của BE nên không hiện */
export const entityLabel = (log: Pick<AuditLogSummary, 'entityType' | 'entityId'>) => ({
  label: entityTypeLabel(log.entityType),
  code: log.entityType === 'SETTING' || log.entityId == null ? null : String(log.entityId),
})

export const pageRangeText = (page: number, size: number, count: number, total: number) => {
  const first = (page - 1) * size + 1
  return `Hiển thị ${first}–${first + count - 1} / ${total} bản ghi`
}
