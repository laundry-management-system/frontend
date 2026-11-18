import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import { shiftKeys } from '../queryKeys'

export function useCurrentShift() {
  return useQuery({
    queryKey: shiftKeys.current(),
    queryFn: shiftsApi.current,
    refetchOnWindowFocus: true,
  })
}
