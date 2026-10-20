import type { LoginFailureKind, Role, SetupPasswordFailure } from './types'

export const homePathFor = (roles: Role[]) => (roles.includes('ADMIN') ? '/' : '/work-list')

export const LOCK_DURATION_MS = 15 * 60_000

// BE trả mọi lỗi đăng nhập là 400 và chỉ phân biệt bằng câu chữ (BE-1) – đổi câu chữ BE thì sửa ở đây
export function classifyLoginError(err: {
  status: number
  message: string
  fieldErrors: Record<string, string>
}): LoginFailureKind {
  switch (true) {
    case err.status === 0 || err.status >= 500:
      return 'network'
    case err.status === 400 && err.message.includes('bị khóa'):
      return 'locked'
    case err.status === 400 && err.message.includes('vô hiệu hóa'):
      return 'disabled'
    case err.status === 400 && Object.keys(err.fieldErrors).length > 0:
      return 'validation'
    default:
      return 'invalid'
  }
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

// BE chưa kiểm mật khẩu khi đặt lần đầu nên FE chặn ở đây (8–255 như lúc tạo tài khoản cũ)
export function validateNewPassword(value: string): string | null {
  if (!value) return 'Vui lòng nhập mật khẩu'
  if (value.length < 8) return 'Mật khẩu tối thiểu 8 ký tự'
  if (value.length > 255) return 'Mật khẩu tối đa 255 ký tự'
  return null
}

export function validateConfirmPassword(value: string, password: string): string | null {
  if (!value) return 'Vui lòng nhập lại mật khẩu'
  return value === password ? null : 'Mật khẩu nhập lại không khớp'
}

// BE chỉ phân biệt lỗi đặt mật khẩu bằng câu chữ (BE-1) – đổi câu chữ BE thì sửa ở đây
export function classifySetupPasswordError(err: {
  status: number
  message: string
}): SetupPasswordFailure {
  switch (true) {
    case err.status === 0 || err.status >= 500:
      return 'network'
    case err.message.includes('không hợp lệ hoặc đã hết hạn'):
      return 'invalid-link'
    case err.message.includes('đã được kích hoạt'):
      return 'already-active'
    default:
      return 'unknown'
  }
}
