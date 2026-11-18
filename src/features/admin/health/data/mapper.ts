import type { Health } from '../domain/types'
import type { HealthResponseDto } from './dto'

export const toHealth = (dto: HealthResponseDto): Health => ({
  api: dto.status,
  database: dto.database,
  checkedAt: new Date(dto.time),
})
