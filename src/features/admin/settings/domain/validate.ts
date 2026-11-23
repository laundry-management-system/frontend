import type { SettingType } from './types'

// Cùng luật với SettingType của BE để lỗi hiện ngay trên form thay vì đợi BE trả 400
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DIGITS = /^\d+$/
const PHONE = /^0\d{9}$/

/** `0901.234.567`, `+84 901 234 567` → `0901234567`; chuỗi sai giữ nguyên để báo lỗi */
export function normalizeStorePhone(raw: string): string {
  const v = raw.trim().replace(/[\s.-]/g, '')
  if (v.startsWith('+84')) return `0${v.slice(3)}`
  if (v.startsWith('84') && v.length === 11) return `0${v.slice(2)}`
  return v
}

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
    case 'BOOLEAN':
      return v === 'true' || v === 'false' ? null : 'Chỉ nhận true hoặc false'
    case 'STRING':
      return v ? null : 'Không được để trống'
    case 'PHONE': {
      // Rỗng = chưa có số, landing ẩn nút gọi
      const phone = normalizeStorePhone(v)
      return !phone || PHONE.test(phone)
        ? null
        : 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0'
    }
  }
}

export function validateOpeningHours(open: string, close: string): string | null {
  if (!TIME.test(open.trim()) || !TIME.test(close.trim())) return null
  return close.trim() > open.trim() ? null : 'Giờ đóng cửa phải sau giờ mở cửa'
}
