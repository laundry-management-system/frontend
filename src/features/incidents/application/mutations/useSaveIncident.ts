import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveIncidentRequestDto } from '../../data/dto'
import { incidentsApi } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function useSaveIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id?: number; dto: SaveIncidentRequestDto }) =>
      id ? incidentsApi.update(id, dto) : incidentsApi.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: incidentKeys.all }),
  })
}
