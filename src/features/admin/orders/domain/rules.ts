import type {
  ItemUnit,
  OrderDetail,
  OrderFulfillment,
  OrderLine,
  OrderStatus,
  OrderSummary,
  PrimaryAction,
} from './types'

/** Đơn giao tận nơi online: chỉ khách tự áp voucher, nhân viên chỉ xem (FR-044). */
export const isVoucherLocked = (o: Pick<OrderDetail, 'channel' | 'fulfillment'>) =>
  o.channel === 'ONLINE' && o.fulfillment?.returnMethod === 'DELIVERY'

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

type Online = Pick<OrderSummary, 'status' | 'channel'>

const isPending = (o: Online) => o.channel === 'ONLINE' && o.status === 'PENDING_CONFIRMATION'

export const canConfirm = isPending
export const canReject = isPending

/** FR-032: chỉ hủy ở Chờ nhận đồ; Chờ xác nhận dùng "Từ chối". */
export const canCancel = (o: Pick<OrderSummary, 'status'>) => o.status === 'AWAITING_DROPOFF'

/** Lý do khóa thao tác xử lý (phân loại, thu tiền, in phiếu) trước khi nhận đồ; null = không khóa. */
export const preReceiptLockReason = (o: Pick<OrderSummary, 'status'>) =>
  o.status === 'PENDING_CONFIRMATION' || o.status === 'AWAITING_DROPOFF'
    ? 'Đơn online chưa nhận đồ, chưa thể thực hiện thao tác này'
    : null

type Fulfil = Online &
  Pick<OrderSummary, 'returnStatus' | 'paymentStatus'> & {
    fulfillment: Pick<OrderFulfillment, 'dropoffMethod' | 'returnMethod'> | null
  }

export const canCompleteDropoff = (o: Online) =>
  o.channel === 'ONLINE' && o.status === 'AWAITING_DROPOFF'

const awaitingDelivery = (o: Fulfil) =>
  o.channel === 'ONLINE' &&
  o.status === 'COMPLETED' &&
  o.fulfillment?.returnMethod === 'DELIVERY' &&
  o.returnStatus === 'AWAITING_DELIVERY'

/** FR-036: đơn online giao tận nơi phải thanh toán trước khi giao. */
export const canStartDelivery = (o: Fulfil) => awaitingDelivery(o) && o.paymentStatus === 'PAID'

export const isAwaitingPayment = (o: Fulfil) => awaitingDelivery(o) && o.paymentStatus === 'UNPAID'

/** FR-048: có báo thanh toán của khách đang chờ và đơn còn UNPAID. */
export const canRejectPaymentClaim = (
  o: Pick<OrderSummary, 'paymentStatus' | 'paymentClaimedAt'>,
) => o.paymentClaimedAt != null && o.paymentStatus === 'UNPAID'

export const canUndoDelivery = (o: Pick<OrderSummary, 'returnStatus'>) =>
  o.returnStatus === 'DELIVERING'

/** FR-037: mã vận đơn chỉ ở chặng có thật, đơn chưa kết thúc. */
export const canEditPickupTracking = (o: Fulfil) =>
  o.channel === 'ONLINE' && !isTerminal(o.status) && o.fulfillment?.dropoffMethod === 'PICKUP'

export const canEditDeliveryTracking = (o: Fulfil) =>
  o.channel === 'ONLINE' && !isTerminal(o.status) && o.fulfillment?.returnMethod === 'DELIVERY'

/** Đơn online không được bỏ qua "Đang giao" khi trả đồ (FR-021). */
export const canDeliver = (o: Pick<OrderSummary, 'channel' | 'returnStatus'>) =>
  o.channel !== 'ONLINE' ||
  o.returnStatus === 'DELIVERING' ||
  o.returnStatus === 'AWAITING_CUSTOMER_COLLECT'

/** FR-059: đơn giao tận nơi đang giao do khách tự xác nhận đã nhận; nhân viên chỉ có đường thay khách. */
export const awaitsCustomerReceipt = (o: Pick<OrderSummary, 'channel' | 'returnStatus'>) =>
  o.channel === 'ONLINE' && o.returnStatus === 'DELIVERING'

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

export const canRevertStatus = (o: Partial<Pick<OrderSummary, 'returnStatus'>>) =>
  o.returnStatus !== 'DELIVERING'

export function adminActionsOf(
  o: Pick<OrderSummary, 'status'> & Partial<Pick<OrderSummary, 'returnStatus'>>,
) {
  const ended = isTerminal(o.status)
  return {
    revert: !canRevertStatus(o)
      ? off('Đơn đang giao, hãy hoàn tác Đang giao trước')
      : previousStatus(o.status)
        ? on()
        : off('Không có bước trước để lùi về'),
    undoDelivery: canUndoDelivery({ returnStatus: o.returnStatus ?? null })
      ? on()
      : off('Đơn không ở trạng thái Đang giao'),
    reschedule: ended ? off('Đơn đã kết thúc') : on(),
    price: ended ? off('Đơn đã kết thúc') : on(),
    cancel: canCancel(o) ? on() : off('Chỉ hủy được đơn chưa nhận đồ'),
  }
}

export const DETAIL_TABS = [
  'overview',
  'items',
  'fulfillment',
  'payment',
  'incidents',
  'history',
] as const
export type DetailTab = (typeof DETAIL_TABS)[number]

export interface DetailTabInput extends Pick<OrderSummary, 'status' | 'paymentStatus' | 'channel'> {
  hasItems: boolean
  hasIncidents: boolean
  hasPayments: boolean
}

/** Tab nào có nội dung theo giai đoạn của đơn; chưa nhận đồ / chưa phân loại thì chưa có gì để xem hay thu. */
export function visibleDetailTabs(o: DetailTabInput): DetailTab[] {
  const beforeReceipt = o.status === 'PENDING_CONFIRMATION' || o.status === 'AWAITING_DROPOFF'
  const cancelled = o.status === 'CANCELLED'
  const live = !beforeReceipt && !cancelled
  const show: Record<DetailTab, boolean> = {
    overview: true,
    items: o.hasItems || live,
    fulfillment: o.channel === 'ONLINE',
    payment: o.hasPayments || (live && o.hasItems),
    incidents: o.hasIncidents || live,
    history: true,
  }
  return DETAIL_TABS.filter((t) => show[t])
}

export function defaultDetailTab(o: DetailTabInput): DetailTab {
  const visible = visibleDetailTabs(o)
  const wanted: DetailTab =
    o.channel === 'ONLINE' &&
    (o.status === 'PENDING_CONFIRMATION' || o.status === 'AWAITING_DROPOFF')
      ? 'fulfillment'
      : o.status === 'RECEIVED' || o.status === 'PROCESSING'
        ? 'items'
        : o.status === 'COMPLETED' && o.paymentStatus === 'UNPAID'
          ? 'payment'
          : 'overview'
  return visible.includes(wanted) ? wanted : 'overview'
}
