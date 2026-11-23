import { useQuery } from '@tanstack/react-query'
import { washModesApi } from '../../data/washModesApi'
import { serviceKeys } from '../queryKeys'

export function useWashMode(id: number | null) {
  return useQuery({
    queryKey: serviceKeys.washMode(id ?? 0),
    queryFn: () => washModesApi.get(id!),
    enabled: id != null,
  })
}
