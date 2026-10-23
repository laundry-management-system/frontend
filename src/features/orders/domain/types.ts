export type OrderStatus = 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'

export type PaymentStatus = 'UNPAID' | 'PAID'

export type OrderType = 'NORMAL' | 'EXPRESS'

export type ItemUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'

export const ORDER_STATUSES = [
  'RECEIVED',
  'PROCESSING',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
] as const satisfies readonly OrderStatus[]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: 'Mới nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  NORMAL: 'Tiêu chuẩn',
  EXPRESS: 'Giặt nhanh',
}

export const CONDITION_TAGS = [
  'Vết bẩn',
  'Bị rách',
  'Dễ phai màu',
  'Cần giặt riêng',
  'Khác',
] as const

export type ConditionTag = (typeof CONDITION_TAGS)[number]

export interface OrderSummary {
  id: number
  orderCode: string
  customerName: string
  customerPhone: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalItemsCount: number
  receivedAt: string
  dueAt: string
}

export interface OrderListItem extends OrderSummary {
  orderType: OrderType
  totalAmount: number
  isOverdue: boolean
  /** Mã lượt nhận NH-…; null với đơn tạo trước tiếp nhận v3 */
  intakeCode: string | null
  washWhitesSeparately: boolean
}

/** Dịch vụ chọn ở quầy: ghi chú tham khảo để tách đơn / gợi ý dòng, không có giá */
export interface RequestedService {
  id: number
  /** null nếu dịch vụ đã bị xóa */
  name: string | null
  unit: ItemUnit | null
}

export interface OrderImage {
  id: number
  imageUrl: string
  note: string | null
}

export type HistoryActionType =
  | 'CREATED'
  | 'STATUS_CHANGE'
  | 'REVERT_STATUS'
  | 'RESCHEDULE'
  | 'PRICE_ADJUST'
  | 'ITEMS_UPDATED'
  | 'CANCELLED'

export interface OrderHistoryEntry {
  id: number
  actionType: HistoryActionType
  actionDescription: string
  oldValue: string | null
  newValue: string | null
  reason: string | null
  performedBy: string | null
  createdAt: string
}

export interface NotificationResult {
  channel: 'ZALO' | 'SMS'
  message: string
  deepLink: string
  publicLookupUrl: string
  lastNotifiedAt: string | null
  notifyCount: number
}

export type PrimaryAction = 'CLASSIFY' | 'START' | 'COMPLETE' | 'DELIVER'

export interface OrderLine {
  id?: number
  itemType: string
  /** 0 = chưa chọn dịch vụ */
  serviceId: number
  unit: ItemUnit
  /** `''` là giá trị rỗng của NumberInput */
  quantity: number | ''
  unitPrice: number
  conditionTags: ConditionTag[]
  conditionText: string
  /** Ảnh chọn tại chỗ; tải lên documents và gắn vào dòng khi lưu phân loại */
  localImages: File[]
  images?: OrderImage[]
  /** Tối thiểu tính tiền (đơn v3: theo dịch vụ hiện hành; sau phân loại là giá trị đã chốt) */
  minQuantity?: number
  /** KL/SL tính tiền đã chốt (chỉ đọc, từ BE) */
  billableQuantity?: number
}

export interface OrderDetail extends OrderSummary {
  orderType: OrderType
  receiptPrintedAt: string | null
  note: string | null
  items: OrderLine[]
  bagCount: number
  shelfLocation: string | null
  isOverdue: boolean
  subtotal: number
  discountAmount: number
  expressFee: number
  totalAmount: number
  receiverName: string | null
  receiverRelation: string | null
  completedAt: string | null
  deliveredAt: string | null
  /** Suy ra từ mục lịch sử CREATED (BE không trả createdBy – handoff 008 #7) */
  createdBy: string | null
  history: OrderHistoryEntry[]
  intakeCode: string | null
  customerId: number | null
  requestedServices: RequestedService[]
  washWhitesSeparately: boolean
  /** 0 tới khi phân loại (chốt lúc phân loại) */
  whitesFee: number
}

export interface Voucher {
  code: string
  discountType: 'PERCENT' | 'AMOUNT'
  discountValue: number
  /** YYYY-MM-DD, tính cả hai đầu */
  startDate: string
  endDate: string
  minOrderValue: number
  maxUses: number
  usedCount: number
  status: 'ACTIVE' | 'DISABLED'
}

/** Nội dung in trên phiếu nhận đồ (khớp `OrderReceiptResponse`) */
export interface ReceiptData {
  orderCode: string
  receivedAt: string
  customerName: string
  customerPhone: string
  dueAt: string
  shopName: string
  hotline: string
  orderType?: OrderType
  /** Chỉ in khi lượt có 2 đơn */
  intakeCode?: string | null
  intakeOrderIndex?: number
  intakeOrderCount?: number
  washWhitesSeparately?: boolean
  whitesFee?: number
  /** Dịch vụ đã chọn kèm giá hiện hành (giá tham khảo) */
  services?: ReceiptService[]
}

export interface ReceiptService {
  name: string
  unit: ItemUnit
  unitPrice: number
  expressSurcharge: number | null
  minQuantity: number
}

export interface Totals {
  subtotal: number
  discount: number
  expressFee: number
  whitesFee: number
  total: number
  perLine: number[]
}

/** Thông tin dịch vụ cần để tính tiền, khớp `Service` của features/services */
export interface PricingService {
  expressSupported: boolean
  expressSurcharge: number | null
}

// Khớp key nhóm `order` trong shared/config/domainStatuses
export const ORDER_STATUS_KEY: Record<OrderStatus, string> = {
  RECEIVED: 'new',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}
