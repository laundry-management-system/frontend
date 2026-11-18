import { useQuery } from '@tanstack/react-query'
import { incidentsApi, type IncidentStatsParams } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function useIncidentStats(params: IncidentStatsParams = {}) {
  return useQuery({
    queryKey: incidentKeys.stats(params),
    queryFn: () => incidentsApi.stats(params),
    placeholderData: (prev) => prev,
  })
}
