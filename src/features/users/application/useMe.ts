import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../data/usersApi'
import { userKeys } from './queryKeys'

/** Hồ sơ người đang đăng nhập; chỉ dùng trong vùng đã đăng nhập. Lỗi thì nơi dùng tự fallback. */
export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: usersApi.me,
    staleTime: Infinity,
    retry: false,
  })
}
