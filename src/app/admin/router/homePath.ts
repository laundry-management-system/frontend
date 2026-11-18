import type { Role } from '@/features/admin/auth'
import { PATHS } from '@/shared/common/config/paths'

export const homePathFor = (roles: Role[]) =>
  roles.includes('ADMIN') ? PATHS.dashboard : PATHS.workList
