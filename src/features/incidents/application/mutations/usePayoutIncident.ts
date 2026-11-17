import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateShifts } from '@/features/shifts'
import type { PayoutMethod } from '../../domain/types'
import { incidentsApi } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function usePayoutIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, method }: { id: number; method: PayoutMethod }) =>
      incidentsApi.payout(id, method),
    // Khoản chi đổi tiền mặt dự kiến của ca đang mở
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      invalidateShifts(queryClient)
    },
  })
}
