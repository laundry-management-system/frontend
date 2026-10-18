import { create } from 'zustand'
import { decodeAccessToken } from '../data/jwt'
import type { AuthUser, Role } from '../domain/types'

export type { AuthUser }

type AuthStatus = 'unknown' | 'authenticated' | 'anonymous'

interface AuthState {
  status: AuthStatus
  token: string | null
  user: AuthUser | null
  setSession: (token: string) => void
  clear: () => void
}

// Token chỉ giữ trong bộ nhớ; tải lại trang thì khôi phục bằng refresh cookie (restoreSession)
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'unknown',
  token: null,
  user: null,
  setSession: (token) => {
    const user = decodeAccessToken(token)
    set(
      user
        ? { status: 'authenticated', token, user }
        : { status: 'anonymous', token: null, user: null },
    )
  },
  clear: () => set({ status: 'anonymous', token: null, user: null }),
}))

// Dọn dữ liệu bản cũ để lại: token (persist) và tên tài khoản ghi nhớ (tính năng đã bỏ)
try {
  localStorage.removeItem('laundry-auth')
  localStorage.removeItem('laundry-remember-username')
} catch {
  // storage bị chặn: không có gì để xóa
}

export const selectIsAuthenticated = (s: AuthState) => s.status === 'authenticated'

export const selectHasRole = (role: Role) => (s: AuthState) => s.user?.roles.includes(role) ?? false
