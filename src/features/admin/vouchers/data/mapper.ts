import type { Voucher } from '../domain/types'
import type { VoucherResponseDto } from './dto'

export const toVoucher = (dto: VoucherResponseDto): Voucher => ({
  id: dto.id,
  code: dto.code,
  discountType: dto.discountType,
  discountValue: Number(dto.discountValue),
  startDate: dto.startDate,
  endDate: dto.endDate,
  minOrderValue: Number(dto.minOrderValue),
  maxUses: dto.maxUses,
  usedCount: dto.usedCount,
  status: dto.status,
  createdAt: dto.createdAt,
})
