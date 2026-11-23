import type { DropoffStatus, OrderStatus, ReturnStatus } from './types'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  AWAITING_DROPOFF: 'Chờ nhận đồ',
  RECEIVED: 'Mới nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

export const DROPOFF_STATUS_LABEL: Record<DropoffStatus, string> = {
  AWAITING_CUSTOMER_DROPOFF: 'Chờ bạn mang đồ tới',
  CUSTOMER_DROPPED_OFF: 'Tiệm đã nhận đồ của bạn',
  AWAITING_PICKUP: 'Chờ nhân viên tới lấy đồ',
  PICKED_UP: 'Đã lấy đồ của bạn',
}

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  AWAITING_CUSTOMER_COLLECT: 'Chờ bạn tới nhận đồ',
  CUSTOMER_COLLECTED: 'Bạn đã nhận đồ',
  AWAITING_DELIVERY: 'Chờ giao đồ cho bạn',
  DELIVERING: 'Đang giao tới bạn',
  DELIVERED: 'Đã giao thành công',
}

/** Nhãn trạng thái hiển thị cho khách: khi đơn đã giặt xong thì theo tiến độ trả đồ để khớp stepper. */
export function orderStatusLabel(o: {
  status: OrderStatus
  fulfillment: { returnMethod: 'AT_STORE' | 'DELIVERY'; returnStatus: ReturnStatus | null } | null
}): string {
  if (o.status === 'COMPLETED') {
    if (o.fulfillment?.returnStatus === 'DELIVERING') return 'Đang giao'
    if (o.fulfillment?.returnMethod === 'DELIVERY') return 'Giặt xong'
    if (o.fulfillment?.returnStatus === 'AWAITING_CUSTOMER_COLLECT') return 'Sẵn sàng nhận'
  }
  return ORDER_STATUS_LABEL[o.status]
}
