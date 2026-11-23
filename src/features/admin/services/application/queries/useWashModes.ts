import { useQuery } from '@tanstack/react-query'
import { washModesApi } from '../../data/washModesApi'
import { serviceKeys } from '../queryKeys'

export function useWashModes() {
  return useQuery({
    queryKey: serviceKeys.washModes(),
    queryFn: washModesApi.list,
    staleTime: 5 * 60_000,
  })
}
