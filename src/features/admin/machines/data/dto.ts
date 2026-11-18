import type { MachineStatus, MachineType } from '../domain/types'

export interface MachineResponseDto {
  id: number
  machineCode: string
  name: string
  type: MachineType
  /** BigDecimal của BE */
  capacityKg: number | string
  status: MachineStatus
  note: string | null
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  location?: string | null
  purchaseDate?: string | null
  warrantyUntil?: string | null
  imageId?: number | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMachineRequestDto {
  name: string
  type: MachineType
  capacityKg: number
  note: string | null
  brand: string | null
  model: string | null
  serialNumber: string | null
  location: string | null
  purchaseDate: string | null
  warrantyUntil: string | null
  imageId: number | null
}

export type UpdateMachineRequestDto = CreateMachineRequestDto

export interface ChangeMachineStatusRequestDto {
  status: MachineStatus
  reason?: string
}
