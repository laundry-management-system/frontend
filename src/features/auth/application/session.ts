import { authApi } from '../data/authApi'
import { useAuthStore } from './authStore'

export async function restoreSession() {
  try {
    useAuthStore.getState().setSession(await authApi.refresh())
  } catch {
    useAuthStore.getState().clear()
  }
}

// shortcut: chỉ gộp refresh trong một tab; nhiều tab cùng refresh vẫn có thể đăng xuất một tab (BE-6), nâng cấp bằng BroadcastChannel/Web Locks nếu gặp thường xuyên.
let pending: Promise<string | null> | null = null

/** Refresh token chỉ dùng được một lần, nên mọi request 401 cùng lúc dùng chung một lần refresh. */
export function refreshOnce() {
  pending ??= authApi
    .refresh()
    .then((token) => {
      useAuthStore.getState().setSession(token)
      return useAuthStore.getState().token
    })
    .catch(() => null)
    .finally(() => {
      pending = null
    })
  return pending
}

export async function logout() {
  await authApi.logout().catch(() => {})
  useAuthStore.getState().clear()
}
