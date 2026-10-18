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

export function validateUsername(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Vui lòng nhập tài khoản'
  if (v.length < 10) return 'Tên đăng nhập tối thiểu 10 ký tự'
  if (v.length > 50) return 'Tên đăng nhập tối đa 50 ký tự'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Vui lòng nhập mật khẩu tạm'
  if (value.length < 8) return 'Mật khẩu tối thiểu 8 ký tự'
  if (value.length > 255) return 'Mật khẩu tối đa 255 ký tự'
  return null
}
