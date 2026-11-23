import { httpClient } from '@/shared/common/api/httpClient'
import type { WashModeDetailDto, WashModeDto, WashModeRequestDto } from './dto'
import { toWashMode } from './mapper'

export const washModesApi = {
  list: async () => (await httpClient.get<WashModeDto[]>('/wash-modes')).data.map(toWashMode),

  get: async (id: number) =>
    toWashMode((await httpClient.get<WashModeDetailDto>(`/wash-modes/${id}`)).data),

  create: async (dto: WashModeRequestDto) =>
    toWashMode((await httpClient.post<WashModeDetailDto>('/wash-modes', dto)).data),

  update: async (id: number, dto: WashModeRequestDto) =>
    toWashMode((await httpClient.put<WashModeDetailDto>(`/wash-modes/${id}`, dto)).data),
}
