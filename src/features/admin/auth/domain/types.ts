export type Role = 'ADMIN' | 'STAFF'

export interface AuthUser {
  username: string
  roles: Role[]
}

export const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Chủ tiệm', STAFF: 'Nhân viên' }

export type LoginFailureKind = 'invalid' | 'locked' | 'disabled' | 'validation' | 'network'

export type SetupPasswordFailure = 'invalid-link' | 'already-active' | 'network' | 'unknown'
