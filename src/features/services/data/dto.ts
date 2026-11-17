import type { PriceField, ServiceStatus, ServiceUnit } from '../domain/types'

export interface ServiceResponseDto {
  id: number
  serviceCode: string
  name: string
  unit: ServiceUnit
  unitDisplayName: string | null
  currentPrice: number | string
  standardHours: number
  expressSupported: boolean | null
  expressSurcharge: number | string | null
  expressHours: number | null
  minQuantity?: number | string | null
  whitesApplicable?: boolean | null
  status: ServiceStatus
  createdAt: string
  updatedAt: string
}

export interface CreateServiceRequestDto {
  name: string
  unit: ServiceUnit
  currentPrice: number
  standardHours: number
  expressSupported: boolean
  expressSurcharge: number | null
  expressHours: number | null
  minQuantity: number
  whitesApplicable: boolean
}

export type UpdateServiceRequestDto = CreateServiceRequestDto & {
  /** Bắt buộc khi đổi đơn giá, phụ phí, thời gian hoặc trạng thái (BR-C02) */
  priceChangeReason?: string
  status: ServiceStatus
}

export interface PriceHistoryRowResponseDto {
  logId: number
  changedAt: string
  serviceId: number
  serviceCode: string | null
  serviceName: string
  unit: ServiceUnit | null
  field: PriceField
  oldValue: string | null
  newValue: string | null
  changedById: number
  changedByName: string
  reason: string | null
}

export interface PriceIssuedResponseDto {
  effectiveFrom: string | null
  issuedBy: string | null
}
