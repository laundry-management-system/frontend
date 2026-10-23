import type { Service } from '../domain/types'
import type { ServiceResponseDto } from './dto'

export const toService = (dto: ServiceResponseDto): Service => ({
  id: dto.id,
  code: dto.serviceCode,
  name: dto.name,
  unit: dto.unit,
  price: Number(dto.currentPrice),
  standardHours: dto.standardHours,
  expressSupported: dto.expressSupported ?? false,
  expressSurcharge: dto.expressSurcharge == null ? null : Number(dto.expressSurcharge),
  expressHours: dto.expressHours,
  minQuantity: Number(dto.minQuantity ?? 0),
  whitesApplicable: dto.whitesApplicable ?? false,
  status: dto.status,
})
