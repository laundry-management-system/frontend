import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderKeys } from '@/features/admin/orders'
import type { ApproveIncidentRequestDto } from '../../data/dto'
import { incidentsApi } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function useApproveIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ApproveIncidentRequestDto }) =>
      incidentsApi.approve(id, dto),
    // Duyệt có thể trừ tiền vào đơn: tải lại cả đơn
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
