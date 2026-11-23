import {
  DROPOFF_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  RETURN_STATUS_LABEL,
  type DropoffStatus,
  type HistoryActionType,
  type OrderStatus,
  type ReturnStatus,
} from './types.ts'

export const HISTORY_ACTION_LABEL: Partial<Record<HistoryActionType, string>> = {
  CONFIRMED: 'Xác nhận đơn online',
  DROPOFF_STATUS_CHANGE: 'Cập nhật chiều gửi',
  RETURN_STATUS_CHANGE: 'Cập nhật chiều trả',
  TRACKING_CODE_CHANGE: 'Cập nhật mã vận đơn',
  PAYMENT_CLAIM: 'Khách báo đã chuyển khoản',
  PAYMENT_CLAIM_REJECTED: 'Từ chối báo thanh toán',
}

const STATUS_ACTIONS: HistoryActionType[] = [
  'STATUS_CHANGE',
  'REVERT_STATUS',
  'CANCELLED',
  'CREATED',
  'CONFIRMED',
]

const pad = (n: number) => String(n).padStart(2, '0')

const formatInstant = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function describeHistoryValue(actionType: HistoryActionType, value: string | null) {
  if (value == null || value === '') return null
  if (STATUS_ACTIONS.includes(actionType)) return ORDER_STATUS_LABEL[value as OrderStatus] ?? value
  if (actionType === 'DROPOFF_STATUS_CHANGE')
    return DROPOFF_STATUS_LABEL[value as DropoffStatus] ?? value
  if (actionType === 'RETURN_STATUS_CHANGE')
    return RETURN_STATUS_LABEL[value as ReturnStatus] ?? value
  if (actionType === 'RESCHEDULE') return formatInstant(value)
  if (actionType === 'PRICE_ADJUST') {
    const n = Number(value)
    return Number.isFinite(n) ? `${n.toLocaleString('vi-VN')}đ` : value
  }
  return value
}

export const sortHistory = <T extends { createdAt: string }>(entries: T[]) =>
  [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
