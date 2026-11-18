import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import type { ShiftListParams } from '../../domain/types'
import { shiftKeys } from '../queryKeys'

export function useShifts(params: ShiftListParams) {
  return useQuery({
    queryKey: shiftKeys.list(params),
    queryFn: () => shiftsApi.list(params),
    placeholderData: (prev) => prev,
  })
}
