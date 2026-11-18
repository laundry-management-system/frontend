import type { IncidentListParams, IncidentStatsParams } from '../data/incidentsApi'

export const incidentKeys = {
  all: ['incidents'] as const,
  list: (params: IncidentListParams) => [...incidentKeys.all, 'list', params] as const,
  stats: (params: IncidentStatsParams) => [...incidentKeys.all, 'stats', params] as const,
  detail: (id: number) => [...incidentKeys.all, 'detail', id] as const,
}
