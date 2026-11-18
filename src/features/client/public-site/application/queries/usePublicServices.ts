import { useQuery } from '@tanstack/react-query'
import { publicSiteApi } from '../../data/publicSiteApi'
import { publicSiteKeys } from '../queryKeys'
import { publicServicesSchema } from '../schemas'

export function usePublicServices() {
  return useQuery({
    queryKey: publicSiteKeys.services(),
    queryFn: async () => publicServicesSchema.parse(await publicSiteApi.services()),
    staleTime: 5 * 60_000,
    retry: 1,
  })
}
