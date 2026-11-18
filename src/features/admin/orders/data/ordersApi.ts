import { httpClient } from '@/shared/common/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/common/api/page'
import type {
  OrderLine,
  OrderStatus,
  PaymentResolution,
  StoredOrderList,
  WorkCounts,
  WorkListParams,
} from '../domain/types'
import { tabParams } from '../domain/workList'
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
  OverdueOrderListResponseDto,
  WorkCountsResponseDto,
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

// BE: `search` chỉ tìm mã/tên, SĐT phải gửi qua `phone`
function termParams(q: string) {
  const term = q.trim()
  if (!term) return {}
  return isPhoneQuery(term) ? { phone: term.replace(/[\s.-]/g, '') } : { search: term }
}

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
    const { data } = await httpClient.get<SpringPage<OrderResponseDto>>('/orders', {
      params: { status, intakeCode, ...termParams(q), page, size, sort: 'receivedAt,desc' },
    })
    return fromSpringPage(data, toOrderListItem)
  },

  /** Danh sách công việc: lọc và phân trang ở BE, cùng ngày hẹn thì xếp theo giờ nhận. */
  listWork: async ({ tab, q, dueFrom, dueTo, page, size }: WorkListParams) => {
    const { statuses, ...filter } = tabParams(tab)
    const { data } = await httpClient.get<SpringPage<OrderResponseDto>>('/orders', {
      params: {
        statuses: statuses.join(','),
        ...filter,
        ...termParams(q),
        dueFrom,
        dueTo,
        page,
        size,
        sort: ['dueAt,asc', 'receivedAt,asc'],
      },
      // Gửi mảng thành `sort=a&sort=b` (mặc định axios gửi `sort[]=`, Spring không đọc)
      paramsSerializer: { indexes: null },
    })
    return fromSpringPage(data, toOrderListItem)
  },

  workCounts: async ({ q, dueFrom, dueTo }: Pick<WorkListParams, 'q' | 'dueFrom' | 'dueTo'>) => {
    const { data } = await httpClient.get<WorkCountsResponseDto>('/orders/work-counts', {
      params: { ...termParams(q), dueFrom, dueTo },
    })
    const counts: WorkCounts = {
      ALL: data.all,
      UNCLASSIFIED: data.unclassified,
      RECEIVED: data.received,
      PROCESSING: data.processing,
      LATE: data.late,
      EXPRESS: data.express,
    }
    return counts
  },

  /** Đồ tồn, lâu nhất trước */
  overdue: async (): Promise<StoredOrderList> => {
    const { data } = await httpClient.get<OverdueOrderListResponseDto>('/orders/overdue')
    return {
      overdueDays: data.overdueDays,
      orders: [...data.orders].sort((a, b) => b.daysInStorage - a.daysInStorage),
    }
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

  /** Áp / đổi / gỡ (null) voucher ở bước thanh toán; BE tự kiểm tra, tính giảm, giữ lượt, đơn 0đ tự PAID */
  applyVoucher: (id: number, voucherCode: string | null) =>
    detail(httpClient.put<OrderDetailResponseDto>(`/orders/${id}/voucher`, { voucherCode })),

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
