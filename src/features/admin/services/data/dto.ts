import type {
  ModeServiceLine,
  PriceField,
  ServicePrice,
  ServiceStatus,
  ServiceUnit,
} from '../domain/types'

export interface ServiceResponseDto {
  id: number
  serviceCode: string
  name: string
  unit: ServiceUnit
  unitDisplayName: string | null
  minQuantity?: number | string | null
  whitesApplicable?: boolean | null
  status: ServiceStatus
  prices?: { washModeId: number; price: number | string }[]
  createdAt: string
  updatedAt: string
}

export interface WashModeDto {
  id: number
  code: string
  name: string
  completionHours: number
  active: boolean
  isDefault: boolean
}

export type WashModeDetailDto = WashModeDto & {
  services: { serviceId: number; price: number | string }[]
}

export interface WashModeRequestDto {
  name: string
  completionHours: number
  active: boolean
  isDefault: boolean
  services: ModeServiceLine[]
}

export interface CreateServiceRequestDto {
  name: string
  unit: ServiceUnit
  prices: ServicePrice[]
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
  washModeId?: number | null
  washModeName?: string | null
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
