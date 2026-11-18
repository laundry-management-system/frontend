import type { DiscountType, VoucherStatus } from '../domain/types'

export interface VoucherResponseDto {
  id: number
  code: string
  discountType: DiscountType
  /** BigDecimal: có thể về dạng chuỗi */
  discountValue: number | string
  startDate: string
  endDate: string
  minOrderValue: number | string
  maxUses: number
  usedCount: number
  remainingUses: number
  status: VoucherStatus
  isUsableNow: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateVoucherRequestDto {
  code: string
  discountType: DiscountType
  discountValue: number
  startDate: string
  endDate: string
  minOrderValue: number
  maxUses: number
}

export type UpdateVoucherRequestDto = Omit<CreateVoucherRequestDto, 'code'>

export interface ChangeVoucherStatusRequestDto {
  status: VoucherStatus
}
