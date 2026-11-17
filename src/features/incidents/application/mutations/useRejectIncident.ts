import { useMutation, useQueryClient } from '@tanstack/react-query'
import { incidentsApi } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function useRejectIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => incidentsApi.reject(id, note),
    onSettled: () => queryClient.invalidateQueries({ queryKey: incidentKeys.all }),
  })
}
