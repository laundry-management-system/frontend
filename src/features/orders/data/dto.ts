import type {
  HistoryActionType,
  ItemUnit,
  OrderStatus,
  OrderType,
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
  receivedAt: string
  dueAt: string
  orderType: OrderType
  totalAmount: number | string
  isOverdue?: boolean
  overdue?: boolean
  intakeCode?: string | null
  washWhitesSeparately?: boolean | null
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
  'totalItemsCount' | 'totalAmount'
> {
  receiptPrintedAt: string | null
  note: string | null
  items: OrderItemDto[]
  bagCount: number | null
  shelfLocation: string | null
  subtotal: number | string | null
  discountAmount: number | string | null
  expressFee: number | string | null
  totalAmount: number | string | null
  receiverName: string | null
  receiverRelation: string | null
  completedAt: string | null
  deliveredAt: string | null
  deliveredBy?: string | null
  historyList: OrderHistoryDto[] | null
  customerId?: number | null
  requestedServices?: { id: number; name: string | null; unit: ItemUnit | null }[] | null
  whitesFee?: number | string | null
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
  orderType?: OrderType
  intakeCode?: string | null
  intakeOrderIndex?: number
  intakeOrderCount?: number
  washWhitesSeparately?: boolean | null
  whitesFee?: number | string | null
  createdBy?: string | null
  services?: {
    name: string
    unit: ItemUnit
    unitPrice: number | string
    expressSurcharge: number | string | null
    minQuantity: number | string | null
  }[]
}

export interface IntakeOrderRequestDto {
  orderType: OrderType
  serviceIds: number[]
  dueAt: string
  washWhitesSeparately: boolean
}

export interface IntakeRequestDto {
  requestId: string
  customerPhone: string
  customerName: string
  orders: IntakeOrderRequestDto[]
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
  reason: string
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
  invoiceNo: string
  paymentMethod: PaymentMethod
  paidAt: string
  status: string
  deliveredAt: string
  deliveredBy: string
  receiverName: string | null
  receiverRelation: string | null
}
