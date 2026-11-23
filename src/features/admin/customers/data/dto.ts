import type { CustomerStatus, OrderStatus, PaymentStatus } from '../domain/types'

export interface CustomerResponseDto {
  id: number
  customerCode: string
  fullName: string
  phone: string
  email: string | null
  source: 'COUNTER' | 'SELF_REGISTERED'
  hasAccount: boolean
  pendingRegistrationId: number | null
  address: string | null
  note: string | null
  isVip: boolean | null
  status: CustomerStatus
  createdBy: string | null
  createdAt: string
  updatedAt: string
  /** Chỉ có ở API danh sách; các API khác trả null */
  orderCount: number | null
  totalSpent: number | string | null
  lastOrderAt: string | null
}

export interface CreateCustomerRequestDto {
  fullName: string
  phone: string
  address: string | null
  note: string | null
}

export type UpdateCustomerRequestDto = CreateCustomerRequestDto

export interface ChangeCustomerStatusRequestDto {
  status: CustomerStatus
}

export interface CustomerOrderDto {
  id: number
  orderCode: string
  washModeName: string | null
  totalAmount: number | string
  status: OrderStatus
  paymentStatus: PaymentStatus
  receivedAt: string | null
}

export interface ActivateRegistrationResponseDto {
  customerId: number
  customerCode: string
  linked: boolean
}
