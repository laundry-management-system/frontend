import type { ListUsersParams } from '../data/usersApi'

export const userKeys = {
  all: ['users'] as const,
  list: (params: ListUsersParams) => [...userKeys.all, 'list', params] as const,
}
