import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '../../data/shiftsApi'
import { shiftKeys } from '../queryKeys'

export function useShiftTransactions(id: number, params: { page: number; size: number }) {
  return useQuery({
    queryKey: shiftKeys.transactions(id, params),
    queryFn: () => shiftsApi.transactions(id, params),
    placeholderData: (prev) => prev,
  })
}
