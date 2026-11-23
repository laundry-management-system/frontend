export interface CustomerProfile {
  customerCode: string
  fullName: string
  phone: string
  email: string | null
  address: string | null
}

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'AWAITING_DROPOFF'
  | 'RECEIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED'

export type DropoffStatus =
  'AWAITING_CUSTOMER_DROPOFF' | 'CUSTOMER_DROPPED_OFF' | 'AWAITING_PICKUP' | 'PICKED_UP'

export type ReturnStatus =
  | 'AWAITING_CUSTOMER_COLLECT'
  | 'CUSTOMER_COLLECTED'
  | 'AWAITING_DELIVERY'
  | 'DELIVERING'
  | 'DELIVERED'

/** Null với đơn OFFLINE. */
export interface CustomerOrderFulfillment {
  dropoffMethod: 'AT_STORE' | 'PICKUP'
  returnMethod: 'AT_STORE' | 'DELIVERY'
  pickupAreaName: string | null
  pickupAddress: string | null
  deliveryAreaName: string | null
  deliveryAddress: string | null
  appointmentAt: string | null
  dueAt: string | null
  dropoffStatus: DropoffStatus | null
  returnStatus: ReturnStatus | null
  pickupTrackingCode: string | null
  deliveryTrackingCode: string | null
  pickupFee: number | null
  deliveryFee: number | null
}

export interface CustomerOrder {
  orderCode: string
  createdAt: string
  channel: 'ONLINE' | 'OFFLINE'
  orderType: string
  fulfillment: CustomerOrderFulfillment | null
  /** Lý do từ chối dành cho khách; không bao giờ là lý do nội bộ. */
  customerRejectReason: string | null
  receivedAt: string | null
  status: OrderStatus
  classified: boolean
  /** Đã phân loại: dịch vụ thực tế; chưa: dịch vụ khách chọn (extra=false). */
  services: { serviceName: string; extra: boolean }[]
  /** 0 khi không có hoặc chưa phân loại. */
  whitesFee: number
  /** Null khi đơn chưa phân loại nên chưa có tổng tiền. */
  totalAmount: number | null
  /** Tiền dịch vụ + phí lấy + phí giao (FR-042); null khi chưa phân loại. */
  payableAmount: number | null
  paymentStatus: 'UNPAID' | 'PAID'
  /** Khách đã báo chuyển khoản, chờ tiệm xác nhận */
  paymentClaimedAt: string | null
}

export interface PaymentQr {
  orderCode: string
  amount: number
  bankId: string
  accountNo: string
  accountName: string
  transferContent: string
  qrImageUrl: string
}

export interface OrderMilestones {
  placedAt: string | null
  receivedAt: string | null
  processingAt: string | null
  completedAt: string | null
  deliveringAt: string | null
  deliveredAt: string | null
}

export interface CustomerOrderDetailItem {
  serviceName: string
  unit: string
  quantity: number
  unitPrice: number
  lineTotal: number
  extra: boolean
  conditionTags: string[]
  images: { url: string }[]
}

export interface CustomerOrderMoney {
  subtotal: number
  expressFee: number
  whitesFee: number
  discountAmount: number
  voucherCode: string | null
  incidentDiscount: number
  totalAmount: number
  payableAmount: number
}

export interface CustomerOrderDetail {
  orderCode: string
  channel: 'ONLINE' | 'OFFLINE'
  orderType: string
  status: OrderStatus
  paymentStatus: 'UNPAID' | 'PAID'
  paymentClaimedAt: string | null
  /** Lý do tiệm từ chối lần báo gần nhất; null nếu chưa bị từ chối hoặc đã báo lại */
  paymentClaimRejectedReason: string | null
  voucherEditable: boolean
  receiptConfirmable: boolean
  classified: boolean
  customerRejectReason: string | null
  milestones: OrderMilestones
  dueAt: string | null
  fulfillment: Omit<CustomerOrderFulfillment, 'dueAt'> | null
  requestedServices: { serviceName: string }[]
  washWhitesSeparately: boolean
  items: CustomerOrderDetailItem[]
  money: CustomerOrderMoney
}
