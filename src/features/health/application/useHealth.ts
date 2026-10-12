import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../data/healthApi'
import { healthKeys } from './queryKeys'

export function useHealth(refetchInterval: number | false = false) {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: healthApi.get,
    refetchInterval,
    retry: false,
  })
}
