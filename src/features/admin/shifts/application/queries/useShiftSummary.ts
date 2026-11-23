import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import { shiftKeys } from '../queryKeys'

export function useShiftSummary() {
  return useQuery({
    queryKey: shiftKeys.summary(),
    queryFn: () => shiftsApi.summary(),
    placeholderData: (prev) => prev,
  })
}
