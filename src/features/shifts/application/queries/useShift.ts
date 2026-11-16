import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import { shiftKeys } from '../queryKeys'

export function useShift(id: number, enabled = true) {
  return useQuery({
    queryKey: shiftKeys.detail(id),
    queryFn: () => shiftsApi.get(id),
    enabled: enabled && Number.isFinite(id),
  })
}
