export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'AWAITING_DROPOFF'
  | 'RECEIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED'

export type OrderChannel = 'ONLINE' | 'OFFLINE'
export type DropoffMethod = 'AT_STORE' | 'PICKUP'
export type ReturnMethod = 'AT_STORE' | 'DELIVERY'
export type DropoffStatus =
  'AWAITING_CUSTOMER_DROPOFF' | 'CUSTOMER_DROPPED_OFF' | 'AWAITING_PICKUP' | 'PICKED_UP'
export type ReturnStatus =
  | 'AWAITING_CUSTOMER_COLLECT'
  | 'CUSTOMER_COLLECTED'
  | 'AWAITING_DELIVERY'
  | 'DELIVERING'
  | 'DELIVERED'

export const ORDER_CHANNEL_LABEL: Record<OrderChannel, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Tại quầy',
}

export const DROPOFF_METHOD_LABEL: Record<DropoffMethod, string> = {
  AT_STORE: 'Khách mang tới',
  PICKUP: 'Cửa hàng lấy tại nhà',
}

export const RETURN_METHOD_LABEL: Record<ReturnMethod, string> = {
  AT_STORE: 'Khách tới nhận',
  DELIVERY: 'Giao tận nơi',
}

export const DROPOFF_STATUS_LABEL: Record<DropoffStatus, string> = {
  AWAITING_CUSTOMER_DROPOFF: 'Chờ khách mang đồ tới',
  CUSTOMER_DROPPED_OFF: 'Khách đã tới đưa đồ',
  AWAITING_PICKUP: 'Chờ lấy đồ',
  PICKED_UP: 'Đã lấy đồ từ khách',
}

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  AWAITING_CUSTOMER_COLLECT: 'Chờ khách tới nhận',
  CUSTOMER_COLLECTED: 'Khách đã nhận đồ',
  AWAITING_DELIVERY: 'Chờ giao',
  DELIVERING: 'Đang giao',
  DELIVERED: 'Đã giao thành công',
}

export type PaymentStatus = 'UNPAID' | 'PAID'

export type ItemUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'

export const ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'AWAITING_DROPOFF',
  'RECEIVED',
  'PROCESSING',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
] as const satisfies readonly OrderStatus[]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  AWAITING_DROPOFF: 'Chờ nhận đồ',
  RECEIVED: 'Mới nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
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
  /** null với đơn online chưa nhận đồ */
  receivedAt: string | null
  dueAt: string
  channel: OrderChannel
  createdAt: string | null
  /** null với đơn tại quầy */
  appointmentAt: string | null
  appointmentOverdue: boolean
  dropoffStatus: DropoffStatus | null
  returnStatus: ReturnStatus | null
  pickupTrackingCode: string | null
  deliveryTrackingCode: string | null
  /** Khách báo đã chuyển khoản, chờ tiệm xác nhận (FR-048) */
  paymentClaimedAt: string | null
}

export interface OrderListItem extends OrderSummary {
  washModeId: number | null
  washModeName: string | null
  totalAmount: number
  /** Tiền dịch vụ + phí lấy + phí giao (FR-042) */
  payableAmount: number
  isOverdue: boolean
  /** Mã lượt nhận NH-…; null với đơn tạo trước tiếp nhận v3 */
  intakeCode: string | null
  washWhitesSeparately: boolean
}

/** Tab của Danh sách công việc; các tab chồng nhau, không cộng thành tổng. */
export type WorkTab = 'ALL' | 'UNCLASSIFIED' | 'RECEIVED' | 'PROCESSING' | 'LATE'

/** Tab khác 'ALL', dùng cho `useListParams` */
export const WORK_TABS = [
  'UNCLASSIFIED',
  'RECEIVED',
  'PROCESSING',
  'LATE',
] as const satisfies readonly WorkTab[]

export const WORK_TAB_LABEL: Record<WorkTab, string> = {
  ALL: 'Tất cả',
  UNCLASSIFIED: 'Chưa phân loại',
  RECEIVED: 'Mới nhận',
  PROCESSING: 'Đang xử lý',
  LATE: 'Chỉ TRỄ',
}

export type WorkCounts = Record<WorkTab, number> & {
  pendingConfirmation: number
  awaitingDropoff: number
  /** Số đơn mở theo hình thức; thiếu = 0 */
  byMode: Record<number, number>
}

export interface WorkListParams {
  tab: WorkTab
  channel?: OrderChannel
  washModeId?: number
  q: string
  /** yyyy-MM-dd, gồm cả hai đầu */
  dueFrom?: string
  dueTo?: string
  /** Bắt đầu từ 0 */
  page: number
  size: number
}

/** Đơn Hoàn thành quá số ngày cấu hình mà khách chưa đến lấy */
export interface StoredOrder {
  orderId: number
  orderCode: string
  customerName: string
  customerPhone: string
  customerVip: boolean
  completedAt: string
  daysInStorage: number
  notifyCount: number
  lastNotifiedAt: string | null
  shelfLocation: string | null
  paymentStatus: PaymentStatus
}

export interface StoredOrderList {
  overdueDays: number
  orders: StoredOrder[]
}

/** Khớp `setMaxResults(200)` của GET /orders/overdue */
export const STORED_ORDERS_LIMIT = 200

/** Dịch vụ chọn ở quầy: gợi ý dòng phân loại, kèm đơn giá đã chụp lúc tạo đơn */
export interface RequestedService {
  id: number
  /** null nếu dịch vụ đã bị xóa */
  name: string | null
  unit: ItemUnit | null
  /** Đơn giá đã chụp (FR-012); null nếu đơn không có ảnh chụp giá */
  unitPrice: number | null
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
  | 'CONFIRMED'
  | 'DROPOFF_STATUS_CHANGE'
  | 'RETURN_STATUS_CHANGE'
  | 'TRACKING_CODE_CHANGE'
  | 'PAYMENT_CLAIM'
  | 'PAYMENT_CLAIM_REJECTED'

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

export interface OrderFulfillment {
  dropoffMethod: DropoffMethod
  returnMethod: ReturnMethod
  pickupAreaId: number | null
  pickupAreaName: string | null
  deliveryAreaId: number | null
  deliveryAreaName: string | null
  pickupAddress: string | null
  deliveryAddress: string | null
  appointmentAt: string | null
  appointmentOverdue: boolean
  contactName: string
  contactPhone: string
  termsAcceptedAt: string | null
  pickupFee: number
  deliveryFee: number
  dropoffStatus: DropoffStatus | null
  returnStatus: ReturnStatus | null
  pickupTrackingCode: string | null
  deliveryTrackingCode: string | null
  customerRejectReason: string | null
}

export interface OrderDetail extends OrderSummary {
  confirmedAt: string | null
  confirmedBy: string | null
  fulfillment: OrderFulfillment | null
  washModeId: number | null
  washModeName: string | null
  /** Giờ hoàn thành đã chụp trên đơn */
  washModeHours: number | null
  receiptPrintedAt: string | null
  note: string | null
  items: OrderLine[]
  bagCount: number
  shelfLocation: string | null
  isOverdue: boolean
  subtotal: number
  discountAmount: number
  voucherCode: string | null
  expressFee: number
  totalAmount: number
  payableAmount: number
  receiverName: string | null
  receiverRelation: string | null
  completedAt: string | null
  deliveredAt: string | null
  deliveredBy: string | null
  /** Suy ra từ mục lịch sử CREATED (BE không trả createdBy – handoff 008 #7) */
  createdBy: string | null
  history: OrderHistoryEntry[]
  intakeCode: string | null
  customerId: number | null
  requestedServices: RequestedService[]
  washWhitesSeparately: boolean
  /** 0 tới khi phân loại (chốt lúc phân loại) */
  whitesFee: number
  incidentDiscount: number
  incidentCodes: string[]
  /** Điều khoản bồi thường chốt theo đơn (đơn cũ: cấu hình hiện hành) */
  compensationMultiplier: number
  compensationCap: number
  paymentClaimRejectedReason: string | null
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
  washModeName?: string
  /** Chỉ in khi lượt có 2 đơn */
  intakeCode?: string | null
  intakeOrderIndex?: number
  intakeOrderCount?: number
  washWhitesSeparately?: boolean
  whitesFee?: number
  /** Dịch vụ đã chọn kèm giá hiện hành (giá tham khảo) */
  services?: ReceiptService[]
  compensationMultiplier: number
  compensationCap: number
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

// Khớp key nhóm `order` trong shared/config/domainStatuses
export const ORDER_STATUS_KEY: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'pending-confirmation',
  AWAITING_DROPOFF: 'awaiting-dropoff',
  RECEIVED: 'new',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER'
export type PaymentTxnStatus = 'CONFIRMED' | 'VOIDED' | 'REFUNDED'
export type PaymentResolution = 'VOIDED' | 'REFUNDED'

export interface PaymentTxn {
  id: number
  invoiceNo: string
  amount: number
  method: PaymentMethod
  paidAt: string
  /** User id; BE chưa trả tên (handoff 010 #1) */
  confirmedBy: number
  referenceCode: string | null
  status: PaymentTxnStatus
  /** Dùng chung cho hủy xác nhận và hoàn tiền */
  voidedBy: number | null
  voidedAt: string | null
  voidReason: string | null
}

export interface VietQr {
  amount: number
  bankId: string
  accountNo: string
  accountName: string
  transferContent: string
  qrImageUrl: string
}

export interface DeliveryResult {
  orderCode: string
  customerName: string
  /** null: đơn 0đ (voucher giảm hết) trả đồ không cần giao dịch */
  invoiceNo: string | null
  paymentMethod: PaymentMethod | null
  paidAt: string | null
  deliveredAt: string
  /** Username */
  deliveredBy: string
  receiverName: string | null
  receiverRelation: string | null
}

export type CheckoutMode = 'checkout' | 'handover'

export interface InvoiceLine {
  index: number
  name: string
  quantity: number
  unit: ItemUnit
  unitPrice: number
  lineTotal: number
  extra: boolean
}

export interface Invoice {
  washModeName: string | null
  shopName: string
  hotline: string
  /** Các trường thanh toán là `null` khi in hóa đơn cho đơn chưa thanh toán */
  invoiceNo: string | null
  orderCode: string
  customerName: string
  customerPhone: string
  receivedAt: string
  paidAt: string | null
  method: PaymentMethod | null
  referenceCode: string | null
  confirmedByName: string
  lines: InvoiceLine[]
  subtotal: number
  discountAmount: number
  incidentDiscount: number
  incidentCodes: string[]
  expressFee: number
  whitesFee: number
  pickupFee: number
  deliveryFee: number
  totalAmount: number
  /** Chỉ có ở lần in ngay sau khi thu tiền mặt (BE không lưu) */
  cash: { given: number; change: number } | null
  /** `null` = chưa giao; `name: null` = khách tự nhận */
  receiver: { name: string | null; relation: string | null } | null
}
