import { httpClient } from '@/shared/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/api/page'
import type { OrderLine, OrderStatus, PaymentResolution } from '../domain/types'
import type {
  AdjustPriceRequestDto,
  CancelOrderRequestDto,
  ChangeStatusRequestDto,
  CompleteOrderRequestDto,
  ComposeNotificationRequestDto,
  ConfirmPaymentRequestDto,
  DeliveryRequestDto,
  DeliveryResponseDto,
  NotificationResponseDto,
  OrderDetailResponseDto,
  OrderReceiptResponseDto,
  OrderResponseDto,
  IntakeRequestDto,
  PaymentDiscrepancyRequestDto,
  PaymentResponseDto,
  ResolvePaymentRequestDto,
  VietQrResponseDto,
  IntakeResponseDto,
  RescheduleRequestDto,
  RevertStatusRequestDto,
} from './dto'
import {
  toDeliveryResult,
  toItemDto,
  toNotificationResult,
  toOrderDetail,
  toOrderListItem,
  toPaymentTxn,
  toReceiptData,
  toVietQr,
} from './mapper'

export interface OrderListParams {
  status?: OrderStatus
  /** Lọc các đơn cùng lượt nhận (khớp chính xác) */
  intakeCode?: string
  q: string
  /** Bắt đầu từ 0 */
  page: number
  size: number
}

const isPhoneQuery = (q: string) => /^\d+$/.test(q.replace(/[\s.-]/g, ''))

const detail = async (req: Promise<{ data: OrderDetailResponseDto }>) =>
  toOrderDetail((await req).data)

export const ordersApi = {
  /** Tạo lượt nhận 1–2 đơn; đơn chưa có dòng đồ và giá (chốt lúc phân loại). */
  createIntake: async (dto: IntakeRequestDto) => {
    const { data } = await httpClient.post<IntakeResponseDto>('/orders/intake', dto)
    return { intakeCode: data.intakeCode, orders: data.orders.map(toOrderDetail) }
  },

  receipt: async (id: number) => {
    const { data } = await httpClient.get<OrderReceiptResponseDto>(`/orders/${id}/receipt`)
    return { data: toReceiptData(data), qrUrl: data.trackingQrUrl }
  },

  get: async (id: number) =>
    toOrderDetail((await httpClient.get<OrderDetailResponseDto>(`/orders/${id}`)).data),

  /** Đơn v3: BE bỏ qua giá client gửi, tự chốt giá hiện hành và tính tổng (gửi kèm `discountAmount`). */
  updateItems: async (
    id: number,
    items: { line: OrderLine; expressSurcharge: number }[],
    discountAmount?: number,
  ) =>
    toOrderDetail(
      (
        await httpClient.put<OrderDetailResponseDto>(`/orders/${id}/items`, {
          items: items.map(({ line, expressSurcharge }) => toItemDto(line, expressSurcharge)),
          discountAmount,
        })
      ).data,
    ),

  attachItemImage: (orderId: number, itemId: number, documentId: number) =>
    httpClient.post(`/orders/${orderId}/items/${itemId}/images`, { documentId }),

  changeStatus: async (id: number, newStatus: OrderStatus, note?: string) => {
    const dto: ChangeStatusRequestDto = { newStatus, note }
    return toOrderDetail(
      (await httpClient.patch<OrderDetailResponseDto>(`/orders/${id}/status`, dto)).data,
    )
  },

  reschedule: async (id: number, newDueAt: string, reason: string) => {
    const dto: RescheduleRequestDto = { newDueAt, reason }
    return toOrderDetail(
      (await httpClient.patch<OrderDetailResponseDto>(`/orders/${id}/reschedule`, dto)).data,
    )
  },

  list: async ({ status, intakeCode, q, page, size }: OrderListParams) => {
    const term = q.trim()
    // BE: `search` chỉ tìm mã/tên, SĐT phải gửi qua `phone`
    const byPhone = term && isPhoneQuery(term)
    const { data } = await httpClient.get<SpringPage<OrderResponseDto>>('/orders', {
      params: {
        status,
        intakeCode,
        phone: byPhone ? term.replace(/[\s.-]/g, '') : undefined,
        search: term && !byPhone ? term : undefined,
        page,
        size,
        sort: 'receivedAt,desc',
      },
    })
    return fromSpringPage(data, toOrderListItem)
  },

  // shortcut: đếm bằng truy vấn size=1 cho từng trạng thái, đổi khi BE có /orders/counts (handoff 008 #2)
  count: async (status?: OrderStatus) => {
    const { data } = await httpClient.get<SpringPage<OrderResponseDto>>('/orders', {
      params: { status, page: 0, size: 1 },
    })
    return data.totalElements
  },

  startProcessing: (id: number) => ordersApi.changeStatus(id, 'PROCESSING', 'Bắt đầu xử lý'),

  complete: (id: number, shelfLocation: string) => {
    const dto: CompleteOrderRequestDto = { shelfLocation }
    return detail(httpClient.post<OrderDetailResponseDto>(`/orders/${id}/complete`, dto))
  },

  composeNotification: async (orderCode: string, channel: 'ZALO' | 'SMS') => {
    const dto: ComposeNotificationRequestDto = { channel }
    const { data } = await httpClient.post<NotificationResponseDto>(
      `/orders/${orderCode}/notifications/compose`,
      dto,
    )
    return toNotificationResult(data)
  },

  cancel: (id: number, reason: string) => {
    const dto: CancelOrderRequestDto = { reason }
    return detail(httpClient.post<OrderDetailResponseDto>(`/orders/${id}/cancel`, dto))
  },

  revertStatus: (id: number, targetStatus: OrderStatus, reason: string) => {
    const dto: RevertStatusRequestDto = { targetStatus, reason }
    return detail(httpClient.post<OrderDetailResponseDto>(`/orders/${id}/revert-status`, dto))
  },

  adjustPrice: (id: number, newTotalAmount: number, reason: string) => {
    const dto: AdjustPriceRequestDto = { newTotalAmount, reason }
    return detail(httpClient.patch<OrderDetailResponseDto>(`/orders/${id}/price`, dto))
  },

  payments: async (orderCode: string) =>
    (await httpClient.get<PaymentResponseDto[]>(`/orders/${orderCode}/payments`)).data.map(
      toPaymentTxn,
    ),

  vietQr: async (orderCode: string) =>
    toVietQr(
      (await httpClient.get<VietQrResponseDto>(`/orders/${orderCode}/payments/vietqr`)).data,
    ),

  confirmPayment: async (orderCode: string, dto: ConfirmPaymentRequestDto) =>
    toPaymentTxn(
      (await httpClient.post<PaymentResponseDto>(`/orders/${orderCode}/payments`, dto)).data,
    ),

  resolvePayment: async (
    orderCode: string,
    paymentId: number,
    resolution: PaymentResolution,
    reason: string,
  ) => {
    const dto: ResolvePaymentRequestDto = { resolution, reason }
    return toPaymentTxn(
      (
        await httpClient.post<PaymentResponseDto>(
          `/orders/${orderCode}/payments/${paymentId}/resolution`,
          dto,
        )
      ).data,
    )
  },

  recordDiscrepancy: (orderCode: string, dto: PaymentDiscrepancyRequestDto) =>
    httpClient.post(`/orders/${orderCode}/payment-discrepancies`, dto),

  /** Endpoint của module thanh toán: kiểm tra đơn đã thanh toán (`/orders/{id}/deliver` thì không). */
  deliver: async (orderCode: string, dto: DeliveryRequestDto) =>
    toDeliveryResult(
      (await httpClient.post<DeliveryResponseDto>(`/orders/${orderCode}/delivery`, dto)).data,
    ),
}
