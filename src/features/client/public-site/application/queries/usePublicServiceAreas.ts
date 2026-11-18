import { useQuery } from '@tanstack/react-query'
import { publicSiteApi } from '../../data/publicSiteApi'
import { publicSiteKeys } from '../queryKeys'
import { publicServiceAreasSchema } from '../schemas'

export function usePublicServiceAreas() {
  return useQuery({
    queryKey: publicSiteKeys.serviceAreas(),
    queryFn: async () => publicServiceAreasSchema.parse(await publicSiteApi.serviceAreas()),
    staleTime: 5 * 60_000,
    retry: 1,
  })
}
