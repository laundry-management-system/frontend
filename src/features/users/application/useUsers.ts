import { useQuery } from '@tanstack/react-query'
import { usersApi, type ListUsersParams } from '../data/usersApi'
import { userKeys } from './queryKeys'

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: (prev) => prev, // giữ dữ liệu trang cũ khi đổi trang/lọc, tránh nháy
  })
}
