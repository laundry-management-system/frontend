import { httpClient } from '@/shared/api/httpClient'
import type { SettingResponseDto, UpdateSettingRequestDto } from './dto'

export interface ShopSettings {
  /** Phụ phí giặt riêng đồ trắng (đ/đơn) */
  whitesFee: number
}

const toSettings = (dto: SettingResponseDto): ShopSettings => ({ whitesFee: Number(dto.whitesFee) })

export const settingsApi = {
  get: async () => toSettings((await httpClient.get<SettingResponseDto>('/settings')).data),
  update: async (dto: UpdateSettingRequestDto) =>
    toSettings((await httpClient.patch<SettingResponseDto>('/settings', dto)).data),
}
