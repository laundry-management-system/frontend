import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../data/usersApi'
import { userKeys } from './queryKeys'

/** Tên hiển thị của nhân viên theo id (BE thanh toán chỉ trả id người xác nhận). */
export function useUserName(id: number | null) {
  const { data, isError } = useQuery({
    queryKey: userKeys.detail(id ?? 0),
    queryFn: () => usersApi.get(id!),
    enabled: id != null,
    staleTime: Infinity,
    retry: false,
  })
  if (id == null) return '—'
  return data?.fullName ?? (isError ? `#${id}` : '…')
}
