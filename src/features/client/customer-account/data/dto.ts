import type { OrderStatus } from '../domain/types'

export interface AuthenticationResponseDto {
  accessToken: string
}

export interface RegisterRequestDto {
  fullName: string
  phone: string
  email: string | null
  password: string
}

export interface LoginRequestDto {
  identifier: string
  password: string
}

export interface CustomerProfileDto {
  customerCode: string
  fullName: string
  phone: string
  email: string | null
  address: string | null
}

export interface UpdateMyProfileRequestDto {
  fullName: string
  email: string | null
  address: string | null
}

export interface ChangeMyPasswordRequestDto {
  currentPassword: string
  newPassword: string
}

export interface CustomerOrderDto {
  orderCode: string
  receivedAt: string
  status: OrderStatus
  totalAmount: number | null
}
