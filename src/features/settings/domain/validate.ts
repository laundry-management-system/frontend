import type { SettingType } from './types'

// Cùng luật với SettingType của BE để lỗi hiện ngay trên form thay vì đợi BE trả 400
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DIGITS = /^\d+$/

export function validateSetting(type: SettingType, raw: string): string | null {
  const v = raw.trim()
  switch (type) {
    case 'TIME':
      return TIME.test(v) ? null : 'Nhập giờ dạng HH:mm, ví dụ 08:00'
    case 'POSITIVE_INT':
    case 'BANK':
      return DIGITS.test(v) && Number(v) > 0 ? null : 'Phải là số nguyên lớn hơn 0'
    case 'NON_NEGATIVE_INT':
      return DIGITS.test(v) ? null : 'Phải là số nguyên không âm'
    case 'STRING':
      return v ? null : 'Không được để trống'
  }
}

export function validateOpeningHours(open: string, close: string): string | null {
  if (!TIME.test(open.trim()) || !TIME.test(close.trim())) return null
  return close.trim() > open.trim() ? null : 'Giờ đóng cửa phải sau giờ mở cửa'
}
