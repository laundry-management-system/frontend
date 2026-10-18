import type { AuthUser, Role } from '../domain/types'

const ROLES: readonly string[] = ['ADMIN', 'STAFF'] satisfies Role[]

// Chỉ đọc payload để hiển thị/định tuyến; quyền thật do BE kiểm khi gọi API (BE chưa có /users/me)
export function decodeAccessToken(token: string): AuthUser | null {
  try {
    const part = token.split('.')[1]
    const base64 = part
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(part.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (typeof payload !== 'object' || payload === null) return null
    const { sub, roles } = payload as { sub?: unknown; roles?: unknown }
    if (typeof sub !== 'string' || sub === '') return null
    if (!Array.isArray(roles) || roles.length === 0 || !roles.every((r) => ROLES.includes(r)))
      return null
    return { username: sub, roles: roles as Role[] }
  } catch {
    return null
  }
}
