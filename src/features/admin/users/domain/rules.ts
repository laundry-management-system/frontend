const PHONE_RE = /^0\d{9}$/

export function validateFullName(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Vui lòng nhập họ tên'
  if (v.length > 50) return 'Họ tên tối đa 50 ký tự'
  return null
}

export function validatePhone(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Vui lòng nhập số điện thoại'
  if (!PHONE_RE.test(v)) return 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
  return null
}

// Email khớp ràng buộc @Email của BE ở mức cơ bản; BE vẫn kiểm lần cuối
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Vui lòng nhập email'
  if (!EMAIL_RE.test(v)) return 'Email không đúng định dạng'
  return null
}
