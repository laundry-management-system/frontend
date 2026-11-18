import { httpClient } from '@/shared/common/api/httpClient'
import type { HealthResponseDto } from './dto'
import { toHealth } from './mapper'

export const healthApi = {
  get: async () => toHealth((await httpClient.get<HealthResponseDto>('/health')).data),
}
