import { useQuery } from '@tanstack/react-query'
import { customerPortalApi } from '../../data/customerPortalApi'
import { toCustomerProfile } from '../../data/mapper'
import { customerKeys } from '../queryKeys'
import { useCustomerSessionStore } from '../sessionStore'

export function useMyProfile() {
  const status = useCustomerSessionStore((s) => s.status)
  return useQuery({
    queryKey: customerKeys.me(),
    queryFn: async () => toCustomerProfile(await customerPortalApi.getMe()),
    enabled: status === 'authenticated',
  })
}
