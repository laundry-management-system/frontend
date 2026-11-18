import { useQuery } from '@tanstack/react-query'
import { incidentsApi, type IncidentListParams } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function useIncidents(params: IncidentListParams, { enabled = true } = {}) {
  return useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: () => incidentsApi.list(params),
    placeholderData: (prev) => prev,
    enabled,
  })
}
