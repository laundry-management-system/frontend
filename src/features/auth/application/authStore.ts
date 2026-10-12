import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  username: string
  roles: string[]
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'laundry-auth' },
  ),
)

export const selectIsAuthenticated = (s: AuthState) => s.token !== null

export const selectHasRole = (role: string) => (s: AuthState) =>
  s.user?.roles.includes(role) ?? false
