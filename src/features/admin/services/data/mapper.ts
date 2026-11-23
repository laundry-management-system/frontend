import type { PriceHistoryRow, Service, WashModeDetail } from '../domain/types'
import type { PriceHistoryRowResponseDto, ServiceResponseDto, WashModeDetailDto } from './dto'

export const toService = (dto: ServiceResponseDto): Service => ({
  id: dto.id,
  code: dto.serviceCode,
  name: dto.name,
  unit: dto.unit,
  minQuantity: Number(dto.minQuantity ?? 0),
  whitesApplicable: dto.whitesApplicable ?? false,
  status: dto.status,
  prices: (dto.prices ?? []).map((p) => ({ washModeId: p.washModeId, price: Number(p.price) })),
})

/** Danh sách không có `services`; chi tiết thì có. */
export const toWashMode = (
  dto: Omit<WashModeDetailDto, 'services'> & Partial<Pick<WashModeDetailDto, 'services'>>,
): WashModeDetail => ({
  ...dto,
  services: (dto.services ?? []).map((l) => ({ serviceId: l.serviceId, price: Number(l.price) })),
})

export const toPriceHistoryRow = (dto: PriceHistoryRowResponseDto): PriceHistoryRow => ({
  ...dto,
  washModeId: dto.washModeId ?? null,
  washModeName: dto.washModeName ?? null,
  reason: dto.reason ?? '',
})
