import type {
  ItemUnit,
  OrderDetail,
  OrderLine,
  OrderStatus,
  OrderSummary,
  PrimaryAction,
} from './types'

export const ITEM_TYPE_MAX = 100

/** BE chưa có cờ phân loại: đơn tạo nhanh chưa có dòng đồ nào (research R2). */
export const isUnclassified = (o: Pick<OrderSummary, 'status' | 'totalItemsCount'>) =>
  o.status === 'RECEIVED' && o.totalItemsCount === 0

export function validateQuantity(unit: ItemUnit, qty: number | ''): string | null {
  if (qty === '' || !Number.isFinite(qty)) return 'Nhập số lượng'
  if (unit === 'KG') {
    if (qty <= 0) return 'Khối lượng phải lớn hơn 0'
    if (Math.round(qty * 100) !== qty * 100) return 'Tối đa 2 chữ số thập phân'
    return null
  }
  if (!Number.isInteger(qty) || qty < 1) return 'Số lượng phải là số nguyên dương'
  return null
}

/** Đơn tạo theo tiếp nhận v3 (có mã lượt nhận): dòng theo dịch vụ, giá chốt lúc phân loại. */
export const isV3 = (o: { intakeCode: string | null }) => !!o.intakeCode

export function validateLine(line: OrderLine) {
  const errors: Partial<Record<'itemType' | 'serviceId' | 'quantity', string>> = {}
  const itemType = line.itemType.trim()
  if (!itemType) errors.itemType = 'Nhập loại đồ'
  else if (itemType.length > ITEM_TYPE_MAX) errors.itemType = 'Tối đa 100 ký tự'
  if (!line.serviceId) errors.serviceId = 'Chọn dịch vụ'
  else {
    const qtyError = validateQuantity(line.unit, line.quantity)
    if (qtyError) errors.quantity = qtyError
  }
  return errors
}

/** Định dạng SĐT khi đang gõ: chỉ giữ chữ số (tối đa 10), nhóm 4-3-3 "0938 111 222". */
export function formatPhoneTyping(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 10)
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7)].filter(Boolean).join(' ')
}

export const IMAGE_TYPES = ['image/png', 'image/jpeg']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function splitImages<T extends { type: string; size: number }>(files: T[]) {
  const ok = files.filter((f) => IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_BYTES)
  return { ok, rejected: files.length - ok.length }
}

export const isTerminal = (s: OrderStatus) => s === 'DELIVERED' || s === 'CANCELLED'

/** Bước liền trước trong luồng chuẩn; Admin chỉ được lùi một bước (BR-D06). */
export function previousStatus(s: OrderStatus): OrderStatus | null {
  if (s === 'PROCESSING') return 'RECEIVED'
  if (s === 'COMPLETED') return 'PROCESSING'
  return null
}

/** BR-D05: chỉ hủy khi đơn còn Mới nhận. */
export const canCancel = (o: Pick<OrderSummary, 'status'>) => o.status === 'RECEIVED'

export function primaryActionOf(o: Pick<OrderDetail, 'status' | 'items'>): PrimaryAction | null {
  if (o.status === 'RECEIVED') return o.items.length ? 'START' : 'CLASSIFY'
  if (o.status === 'PROCESSING') return 'COMPLETE'
  if (o.status === 'COMPLETED') return 'DELIVER'
  return null
}

export interface ActionAvailability {
  enabled: boolean
  reason?: string
}

const on = (): ActionAvailability => ({ enabled: true })
const off = (reason: string): ActionAvailability => ({ enabled: false, reason })

export function adminActionsOf(o: Pick<OrderSummary, 'status'>) {
  const ended = isTerminal(o.status)
  return {
    revert: previousStatus(o.status) ? on() : off('Không có bước trước để lùi về'),
    reschedule: ended ? off('Đơn đã kết thúc') : on(),
    price: ended ? off('Đơn đã kết thúc') : on(),
    cancel: canCancel(o) ? on() : off('Chỉ hủy được khi đơn còn Mới nhận'),
  }
}
