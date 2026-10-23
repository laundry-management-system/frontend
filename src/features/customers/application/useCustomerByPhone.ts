import { useQuery } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/apiError'
import { customersApi } from '../data/customersApi'
import { customerKeys } from './queryKeys'

/** Tra khách theo SĐT đã chuẩn hóa; `null` = chưa có hồ sơ (BE trả 404). */
export function useCustomerByPhone(phone: string | null) {
  return useQuery({
    queryKey: customerKeys.byPhone(phone ?? ''),
    queryFn: async () => {
      try {
        return await customersApi.getByPhone(phone!)
      } catch (e) {
        if (toApiError(e).status === 404) return null
        throw e
      }
    },
    enabled: !!phone,
    retry: false,
  })
}
