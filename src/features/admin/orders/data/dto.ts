import type { CancelReasonCode } from '../domain/cancelReasons'
import type {
  DropoffStatus,
  OrderChannel,
  OrderFulfillment,
  ReturnStatus,
  HistoryActionType,
  ItemUnit,
  OrderStatus,
  PaymentMethod,
  PaymentResolution,
  PaymentStatus,
  PaymentTxnStatus,
} from '../domain/types'

export interface OrderResponseDto {
  id: number
  orderCode: string
  customerName: string
  customerPhone: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalItemsCount: number
  receivedAt: string | null
  dueAt: string
  washModeId?: number
  washModeName?: string
  totalAmount: number | string
  payableAmount: number | string
  channel: OrderChannel
  createdAt?: string | null
  appointmentAt?: string | null
  appointmentOverdue?: boolean
  dropoffStatus?: DropoffStatus | null
  returnStatus?: ReturnStatus | null
  pickupTrackingCode?: string | null
  deliveryTrackingCode?: string | null
  isOverdue?: boolean
  overdue?: boolean
  intakeCode?: string | null
  washWhitesSeparately?: boolean | null
  paymentClaimedAt?: string | null
}

export interface OrderItemDto {
  id?: number | null
  serviceId: number | null
  itemType: string
  quantity: number | string
  unit: ItemUnit | null
  unitPrice: number | string | null
  expressSurcharge: number | string | null
  lineTotal: number | string | null
  conditionNote: string | null
  images?: { id: number; imageUrl: string; note: string | null }[]
  minQuantity?: number | string | null
  actualQuantity?: number | string | null
  billableQuantity?: number | string | null
}

export interface OrderHistoryDto {
  id: number
  actionType: HistoryActionType
  actionDescription: string
  oldValue: string | null
  newValue: string | null
  reason: string | null
  performedBy: string | null
  createdAt: string
}

export interface OrderDetailResponseDto extends Omit<
  OrderResponseDto,
  'totalItemsCount' | 'totalAmount' | 'payableAmount'
> {
  confirmedAt?: string | null
  confirmedBy?: string | null
  fulfillment?: OrderFulfillment | null
  washModeHours?: number | null
  receiptPrintedAt: string | null
  note: string | null
  items: OrderItemDto[]
  bagCount: number | null
  shelfLocation: string | null
  subtotal: number | string | null
  discountAmount: number | string | null
  voucherCode?: string | null
  expressFee: number | string | null
  totalAmount: number | string | null
  payableAmount: number | string | null
  receiverName: string | null
  receiverRelation: string | null
  completedAt: string | null
  deliveredAt: string | null
  deliveredBy?: string | null
  historyList: OrderHistoryDto[] | null
  customerId?: number | null
  requestedServices?:
    | {
        id: number
        name: string | null
        unit: ItemUnit | null
        unitPrice?: number | string | null
      }[]
    | null
  whitesFee?: number | string | null
  incidentDiscount?: number | string | null
  incidentCodes?: string[] | null
  compensationMultiplier?: number | null
  compensationCap?: number | string | null
  paymentClaimRejectedReason?: string | null
}

export interface OrderReceiptResponseDto {
  orderId: number
  orderCode: string
  customerName: string
  customerPhone: string
  receivedAt: string
  dueAt: string
  trackingQrUrl: string
  shopName: string
  hotline: string
  washModeId?: number
  washModeName?: string
  intakeCode?: string | null
  intakeOrderIndex?: number
  intakeOrderCount?: number
  washWhitesSeparately?: boolean | null
  whitesFee?: number | string | null
  createdBy?: string | null
  compensationMultiplier?: number | null
  compensationCap?: number | string | null
  services?: {
    name: string
    unit: ItemUnit
    unitPrice: number | string
    expressSurcharge: number | string | null
    minQuantity: number | string | null
  }[]
}

export interface IntakeRequestDto {
  requestId: string
  customerPhone: string
  customerName: string
  washModeId: number
  items: { serviceId: number }[]
  washWhitesSeparately: boolean
  dueAt?: string
}

export interface IntakeResponseDto {
  intakeCode: string
  customerId: number
  orders: OrderDetailResponseDto[]
}

export interface UpdateOrderItemsRequestDto {
  items: OrderItemDto[]
  /** Đơn v3: BE kẹp không vượt tiền hàng */
  discountAmount?: number
}

export interface ChangeStatusRequestDto {
  newStatus: OrderStatus
  note?: string
}

export interface RescheduleRequestDto {
  newDueAt: string
  reason: string
}

export interface CompleteOrderRequestDto {
  shelfLocation: string
}

export interface CancelOrderRequestDto {
  reasonCode: CancelReasonCode
  reason?: string
  customerReason?: string
}

export interface RevertStatusRequestDto {
  targetStatus: OrderStatus
  reason: string
}

export interface AdjustPriceRequestDto {
  newTotalAmount: number
  reason: string
}

export interface ComposeNotificationRequestDto {
  channel: 'ZALO' | 'SMS'
}

export interface NotificationResponseDto {
  orderCode: string
  channel: 'ZALO' | 'SMS'
  message: string
  deepLink: string
  publicLookupUrl: string
  lastNotifiedAt: string | null
  notifyCount: number
}

type Amount = number | string

export interface PaymentResponseDto {
  id: number
  orderId: number
  invoiceNo: string
  amount: Amount
  method: PaymentMethod
  paidAt: string
  confirmedBy: number
  referenceCode: string | null
  status: PaymentTxnStatus
  voidedBy: number | null
  voidedAt: string | null
  voidReason: string | null
}

export interface VietQrResponseDto {
  orderCode: string
  amount: Amount
  bankId: string
  accountNo: string
  accountName: string
  transferContent: string
  qrImageUrl: string
}

export interface ConfirmPaymentRequestDto {
  amount: number
  method: PaymentMethod
  referenceCode?: string
}

export interface ResolvePaymentRequestDto {
  resolution: PaymentResolution
  reason: string
}

export interface PaymentDiscrepancyRequestDto {
  receivedAmount: number
  note: string
}

export interface DeliveryRequestDto {
  receiverName?: string
  receiverRelation?: string
}

export interface DeliveryResponseDto {
  orderCode: string
  customerName: string
  customerPhone: string
  dueAt: string
  totalAmount: Amount
  invoiceNo: string | null
  paymentMethod: PaymentMethod | null
  paidAt: string | null
  status: string
  deliveredAt: string
  deliveredBy: string
  receiverName: string | null
  receiverRelation: string | null
}

export interface WorkCountsResponseDto {
  all: number
  unclassified: number
  received: number
  processing: number
  late: number
  express?: number
  byMode?: { washModeId: number; count: number }[]
  pendingConfirmation: number
  awaitingDropoff: number
}

export interface RejectOrderRequestDto {
  reasonCode: CancelReasonCode
  customerReason: string
  reason?: string
}

export interface TrackingRequestDto {
  pickupTrackingCode?: string
  deliveryTrackingCode?: string
}

export interface AppointmentRequestDto {
  appointmentAt?: string
  returnAt?: string
}

export interface OverdueOrderResponseDto {
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

export interface OverdueOrderListResponseDto {
  overdueDays: number
  orders: OverdueOrderResponseDto[]
}
