export interface CustomerProfile {
  customerCode: string
  fullName: string
  phone: string
  email: string | null
  address: string | null
}

export type OrderStatus = 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'

export interface CustomerOrder {
  orderCode: string
  receivedAt: string
  status: OrderStatus
  /** Null khi đơn chưa phân loại nên chưa có tổng tiền. */
  totalAmount: number | null
}
