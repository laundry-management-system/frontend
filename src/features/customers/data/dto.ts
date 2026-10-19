import type { CustomerStatus, OrderStatus, PaymentStatus } from '../domain/types'

export interface CustomerResponseDto {
  id: number
  customerCode: string
  fullName: string
  phone: string
  address: string | null
  note: string | null
  isVip: boolean | null
  status: CustomerStatus
  createdBy: string | null
  createdAt: string
  updatedAt: string
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
  serviceName: string | null
  totalAmount: number | string
  status: OrderStatus
  paymentStatus: PaymentStatus
  receivedAt: string
}
