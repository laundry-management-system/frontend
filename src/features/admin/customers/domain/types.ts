export type CustomerStatus = 'ACTIVE' | 'INACTIVE'

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'AWAITING_DROPOFF'
  | 'RECEIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'UNPAID' | 'PAID'

export interface Customer {
  id: number
  code: string
  fullName: string
  phone: string
  email: string | null
  hasAccount: boolean
  pendingRegistrationId: number | null
  address: string | null
  note: string | null
  isVip: boolean
  status: CustomerStatus
  createdBy: string | null
  createdAt: string
  orderCount: number | null
  totalSpent: number | null
  lastOrderAt: string | null
}

export interface CustomerOrder {
  id: number
  code: string
  receivedAt: string | null
  serviceName: string | null
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
}

export interface CustomerStats {
  orderCount: number
  lastOrderAt: string | null
  totalSpent: number | null
  topService: string | null
}

export interface CustomerFormValues {
  fullName: string
  phone: string
  address: string
  note: string
}

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
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
