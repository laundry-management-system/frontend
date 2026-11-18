import { queryClient } from '@/shared/common/api/queryClient'
import { customerAuthApi } from '../data/customerAuthApi'
import { customerKeys } from './queryKeys'
import { hasCustomerSessionHint, useCustomerSessionStore } from './sessionStore'

export async function restoreCustomerSession() {
  if (!hasCustomerSessionHint()) {
    useCustomerSessionStore.getState().clear()
    return
  }
  try {
    useCustomerSessionStore.getState().setSession(await customerAuthApi.refresh())
  } catch {
    useCustomerSessionStore.getState().clear()
  }
}

let pending: Promise<string | null> | null = null

/** Refresh token chỉ dùng được một lần, nên mọi request 401 cùng lúc dùng chung một lần refresh. */
export function refreshCustomerOnce() {
  // Trong lúc chờ mà đã đăng xuất/đăng nhập tài khoản khác thì bỏ kết quả cũ
  const origin = useCustomerSessionStore.getState().token
  pending ??= customerAuthApi
    .refresh()
    .then((token) => {
      if (useCustomerSessionStore.getState().token !== origin) return null
      useCustomerSessionStore.getState().setSession(token)
      return token
    })
    .catch(() => null)
    .finally(() => {
      pending = null
    })
  return pending
}

export function clearCustomerSession() {
  useCustomerSessionStore.getState().clear()
  queryClient.removeQueries({ queryKey: customerKeys.all })
}

export async function customerLogout() {
  await customerAuthApi.logout().catch(() => {})
  clearCustomerSession()
}
