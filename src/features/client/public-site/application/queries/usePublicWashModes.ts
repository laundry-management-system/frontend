import { useQuery } from '@tanstack/react-query'
import { publicSiteApi } from '../../data/publicSiteApi'
import { publicSiteKeys } from '../queryKeys'
import { publicWashModesSchema } from '../schemas'

export function usePublicWashModes() {
  return useQuery({
    queryKey: publicSiteKeys.washModes(),
    queryFn: async () => publicWashModesSchema.parse(await publicSiteApi.washModes()),
    staleTime: 5 * 60_000,
    retry: 1,
  })
}
