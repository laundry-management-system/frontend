import type { Machine } from '../domain/types'
import type { MachineResponseDto } from './dto'

export const toMachine = (dto: MachineResponseDto): Machine => ({
  id: dto.id,
  code: dto.machineCode,
  name: dto.name,
  type: dto.type,
  capacityKg: Number(dto.capacityKg),
  status: dto.status,
  note: dto.note,
  brand: dto.brand ?? null,
  model: dto.model ?? null,
  serialNumber: dto.serialNumber ?? null,
  location: dto.location ?? null,
  purchaseDate: dto.purchaseDate ?? null,
  warrantyUntil: dto.warrantyUntil ?? null,
  image: dto.imageId != null && dto.imageUrl ? { id: dto.imageId, url: dto.imageUrl } : null,
  updatedAt: dto.updatedAt,
})
