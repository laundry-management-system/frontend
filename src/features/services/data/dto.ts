import type { ServiceStatus, ServiceUnit } from '../domain/types'

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
}

export type UpdateServiceRequestDto = CreateServiceRequestDto & {
  // BE chưa đọc trường này (BE-S1, tính năng nhật ký giá chưa làm); Spring bỏ qua trường lạ
  priceChangeReason?: string
  status: ServiceStatus
}
