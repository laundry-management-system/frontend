import type { Service, ServiceUnit } from '../domain/types'
import type { ServiceResponseDto } from './dto'

const UNIT_BY_DISPLAY: Record<string, ServiceUnit> = {
  kg: 'KG',
  piece: 'PIECE',
  set: 'SET',
  product: 'PRODUCT',
}

export const toService = (dto: ServiceResponseDto): Service => ({
  id: dto.id,
  code: dto.serviceCode,
  name: dto.name,
  unit: UNIT_BY_DISPLAY[dto.unitDisplayName?.toLowerCase() ?? ''] ?? null,
  price: Number(dto.currentPrice),
  standardHours: dto.standardHours,
  expressSupported: dto.expressSupported ?? false,
  expressSurcharge: dto.expressSurcharge == null ? null : Number(dto.expressSurcharge),
  expressHours: dto.expressHours,
  status: dto.status,
})
