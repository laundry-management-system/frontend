import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../data/servicesApi'
import { serviceKeys } from './queryKeys'

export function useActiveServices() {
  return useQuery({
    queryKey: serviceKeys.active(),
    queryFn: servicesApi.listActive,
    staleTime: 5 * 60_000,
  })
}
