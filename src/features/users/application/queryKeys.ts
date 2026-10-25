import type { ListUsersParams } from '../data/usersApi'

export const userKeys = {
  all: ['users'] as const,
  // Nằm dưới `all` để sửa nhân viên (kể cả chính mình) invalidate luôn hồ sơ header
  me: ['users', 'me'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
  list: (params: ListUsersParams) => [...userKeys.all, 'list', params] as const,
}
