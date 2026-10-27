import { httpClient } from '@/shared/api/httpClient'
import type { Setting } from '../domain/types'
import type { SettingResponseDto, SettingUpdateRequestDto } from './dto'

const toSetting = (dto: SettingResponseDto): Setting => ({
  key: dto.settingKey,
  value: dto.value,
  description: dto.description,
  updatedBy: dto.updatedBy,
  updatedAt: dto.updatedAt,
})

export const settingsApi = {
  list: async () => (await httpClient.get<SettingResponseDto[]>('/settings')).data.map(toSetting),
  update: async (key: string, value: string) =>
    toSetting(
      (
        await httpClient.patch<SettingResponseDto>(`/settings/${key}`, {
          value,
        } satisfies SettingUpdateRequestDto)
      ).data,
    ),
}
