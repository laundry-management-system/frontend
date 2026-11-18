import { useQuery } from '@tanstack/react-query'
import { publicSiteApi } from '../../data/publicSiteApi'
import { publicSiteKeys } from '../queryKeys'
import { publicStoreSchema } from '../schemas'

export function usePublicStore() {
  return useQuery({
    queryKey: publicSiteKeys.store(),
    queryFn: async () => publicStoreSchema.parse(await publicSiteApi.store()),
    staleTime: 5 * 60_000,
    retry: 1,
  })
}
