import type { Role } from '@/features/auth'
import { PATHS } from '@/shared/config/paths'

export const homePathFor = (roles: Role[]) =>
  roles.includes('ADMIN') ? PATHS.dashboard : PATHS.workList
