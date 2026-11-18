import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import { shiftKeys } from '../queryKeys'

export function useShiftSummary(range: { from: string; to: string }) {
  return useQuery({
    queryKey: shiftKeys.summary(range),
    queryFn: () => shiftsApi.summary(range),
    placeholderData: (prev) => prev,
  })
}
