import { formatConditionNote, parseConditionNote } from '../domain/conditionNote'
import { sortHistory } from '../domain/history'
import type {
  NotificationResult,
  OrderDetail,
  OrderLine,
  OrderListItem,
  OrderSummary,
  ReceiptData,
} from '../domain/types'
import type {
  NotificationResponseDto,
  OrderDetailResponseDto,
  OrderItemDto,
  OrderReceiptResponseDto,
  OrderResponseDto,
} from './dto'

const money = (v: number | string | null | undefined) => Number(v ?? 0)

// Jackson có thể đặt tên cờ boolean `isOverdue` thành `overdue`
const overdueOf = (dto: { isOverdue?: boolean; overdue?: boolean }) =>
  dto.isOverdue ?? dto.overdue ?? false

export const toOrderSummary = (
  dto: Omit<OrderResponseDto, 'orderType' | 'totalAmount' | 'isOverdue'>,
): OrderSummary => ({
  id: dto.id,
  orderCode: dto.orderCode,
  customerName: dto.customerName,
  customerPhone: dto.customerPhone,
  status: dto.status,
  paymentStatus: dto.paymentStatus,
  totalItemsCount: dto.totalItemsCount,
  receivedAt: dto.receivedAt,
  dueAt: dto.dueAt,
})

export const toOrderListItem = (dto: OrderResponseDto): OrderListItem => ({
  ...toOrderSummary(dto),
  orderType: dto.orderType,
  totalAmount: money(dto.totalAmount),
  isOverdue: overdueOf(dto),
  intakeCode: dto.intakeCode ?? null,
  washWhitesSeparately: dto.washWhitesSeparately ?? false,
})

const optionalNumber = (v: number | string | null | undefined) =>
  v == null ? undefined : Number(v)

const toOrderLine = (dto: OrderItemDto): OrderLine => {
  const { tags, text } = parseConditionNote(dto.conditionNote)
  return {
    id: dto.id ?? undefined,
    itemType: dto.itemType,
    serviceId: dto.serviceId ?? 0,
    unit: dto.unit ?? 'PIECE',
    // Đơn v3 lưu cả KL thực tế lẫn KL tính tiền; ô nhập hiển thị KL thực tế
    quantity: Number(dto.actualQuantity ?? dto.quantity),
    unitPrice: Number(dto.unitPrice ?? 0),
    conditionTags: tags,
    conditionText: text,
    localImages: [],
    images: dto.images ?? [],
    minQuantity: optionalNumber(dto.minQuantity),
    billableQuantity: optionalNumber(dto.billableQuantity),
  }
}

export const toOrderDetail = (dto: OrderDetailResponseDto): OrderDetail => {
  const history = sortHistory(dto.historyList ?? [])
  return {
    ...toOrderSummary({ ...dto, totalItemsCount: dto.items.length }),
    orderType: dto.orderType,
    receiptPrintedAt: dto.receiptPrintedAt,
    note: dto.note,
    items: dto.items.map(toOrderLine),
    bagCount: dto.bagCount ?? 1,
    shelfLocation: dto.shelfLocation,
    isOverdue: overdueOf(dto),
    subtotal: money(dto.subtotal),
    discountAmount: money(dto.discountAmount),
    expressFee: money(dto.expressFee),
    totalAmount: money(dto.totalAmount),
    receiverName: dto.receiverName,
    receiverRelation: dto.receiverRelation,
    completedAt: dto.completedAt,
    deliveredAt: dto.deliveredAt,
    createdBy: history.find((h) => h.actionType === 'CREATED')?.performedBy ?? null,
    history,
    intakeCode: dto.intakeCode ?? null,
    customerId: dto.customerId ?? null,
    requestedServices: dto.requestedServices ?? [],
    washWhitesSeparately: dto.washWhitesSeparately ?? false,
    whitesFee: money(dto.whitesFee),
  }
}

export const toReceiptData = (dto: OrderReceiptResponseDto): ReceiptData => ({
  orderCode: dto.orderCode,
  receivedAt: dto.receivedAt,
  customerName: dto.customerName,
  customerPhone: dto.customerPhone,
  dueAt: dto.dueAt,
  shopName: dto.shopName,
  hotline: dto.hotline,
  orderType: dto.orderType,
  intakeCode: dto.intakeCode ?? null,
  intakeOrderIndex: dto.intakeOrderIndex,
  intakeOrderCount: dto.intakeOrderCount,
  washWhitesSeparately: dto.washWhitesSeparately ?? false,
  whitesFee: money(dto.whitesFee),
  services: dto.services?.map((s) => ({
    name: s.name,
    unit: s.unit,
    unitPrice: Number(s.unitPrice),
    expressSurcharge: s.expressSurcharge == null ? null : Number(s.expressSurcharge),
    minQuantity: Number(s.minQuantity ?? 0),
  })),
})

export const toNotificationResult = (dto: NotificationResponseDto): NotificationResult => ({
  channel: dto.channel,
  message: dto.message,
  deepLink: dto.deepLink,
  publicLookupUrl: dto.publicLookupUrl,
  lastNotifiedAt: dto.lastNotifiedAt,
  notifyCount: dto.notifyCount,
})

/** Gửi `lineTotal` tường minh: BE tự tính sẽ gộp cả phụ phí vào thành tiền (research R7). */
export const toItemDto = (line: OrderLine, expressSurcharge: number): OrderItemDto => {
  const quantity = Number(line.quantity)
  return {
    id: line.id ?? null,
    serviceId: line.serviceId || null,
    itemType: line.itemType.trim(),
    quantity,
    unit: line.unit,
    unitPrice: line.unitPrice,
    expressSurcharge,
    lineTotal: Math.round(line.unitPrice * quantity),
    conditionNote: formatConditionNote(line.conditionTags, line.conditionText),
  }
}
