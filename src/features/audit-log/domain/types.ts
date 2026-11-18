export type AuditAction =
  | 'ACCOUNT_MANAGE'
  | 'ACCOUNT_LOCKED'
  | 'CUSTOMER_PHONE_CHANGE'
  | 'DUE_DATE_CHANGE'
  | 'INCIDENT_APPROVE'
  | 'INCIDENT_PAYOUT'
  | 'MACHINE_STATUS'
  | 'ORDER_PRICE_EDIT'
  | 'PAYMENT_CONFIRM'
  | 'PAYMENT_VOID'
  | 'PAYMENT_REFUND'
  | 'PRICE_CHANGE'
  | 'SET_UP_PASSWORD'
  | 'STATUS_ROLLBACK'
  | 'SETTING_UPDATED'
  | 'SHIFT_OPEN'
  | 'SHIFT_CLOSE'
  | 'SHIFT_CLOSE_ON_BEHALF'
  | 'SHIFT_APPROVE'
  | 'SERVICE_AREA_MANAGE'

export type EntityType =
  | 'AUTH'
  | 'USER'
  | 'CUSTOMER'
  | 'ORDER'
  | 'PAYMENT'
  | 'SERVICE'
  | 'SETTING'
  | 'SHIFT'
  | 'MACHINE'
  | 'INCIDENT'
  | 'SERVICE_AREA'

export interface AuditLogSummary {
  id: number
  /** string: mã BE mới thêm vẫn hiện được (mã gốc) */
  action: string
  entityType: string
  entityId: number | null
  userId: number
  fullName: string | null
  username: string | null
  ipAddress: string | null
  createdAt: string
}

export interface AuditLogDetail extends AuditLogSummary {
  oldData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
  reason: string | null
}

export interface AuditLogFilter {
  /** YYYY-MM-DD theo ngày VN */
  from?: string
  /** YYYY-MM-DD theo ngày VN, tính cả ngày này */
  to?: string
  userId?: number
  action?: AuditAction
  entityType?: EntityType
  /** Từ 1 */
  page: number
}

export interface FieldDiff {
  key: string
  old: string
  new: string
  changed: boolean
  masked: boolean
}
