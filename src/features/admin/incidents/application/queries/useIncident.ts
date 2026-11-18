import { useQuery } from '@tanstack/react-query'
import { toApiError } from '@/shared/common/api/apiError'
import { incidentsApi } from '../../data/incidentsApi'
import { incidentKeys } from '../queryKeys'

export function useIncident(id: number | null) {
  return useQuery({
    queryKey: incidentKeys.detail(id ?? 0),
    queryFn: () => incidentsApi.get(id!),
    enabled: id != null && Number.isFinite(id),
    retry: (count, error) => toApiError(error).status !== 404 && count < 2,
  })
}
