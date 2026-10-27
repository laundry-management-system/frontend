export interface SettingResponseDto {
  settingKey: string
  value: string
  description: string | null
  updatedBy: number | null
  updatedAt: string | null
}

export interface SettingUpdateRequestDto {
  value: string
}
