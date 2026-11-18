import type { OrderStatus } from './types'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: 'Mới nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}
