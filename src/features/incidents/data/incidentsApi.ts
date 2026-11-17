import { httpClient } from '@/shared/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/api/page'
import type { IncidentStatus, IncidentType, PayoutMethod } from '../domain/types'
import type {
  ApproveIncidentRequestDto,
  IncidentDetailDto,
  IncidentStatsDto,
  IncidentSummaryDto,
  SaveIncidentRequestDto,
} from './dto'
import { toIncidentDetail, toIncidentStats, toIncidentSummary, toStatusDto } from './mapper'

export interface IncidentStatsParams {
  q?: string
  type?: IncidentType
  /** YYYY-MM-DD, tính cả hai đầu */
  createdFrom?: string
  createdTo?: string
}

export interface IncidentListParams extends IncidentStatsParams {
  status?: IncidentStatus
  orderId?: number
  /** Từ 0 */
  page: number
  size: number
}

const statsQuery = ({ q, type, createdFrom, createdTo }: IncidentStatsParams) => ({
  q: q || undefined,
  type,
  createdFrom,
  createdTo,
})

export const incidentsApi = {
  list: async ({ status, orderId, page, size, ...rest }: IncidentListParams) => {
    const { data } = await httpClient.get<SpringPage<IncidentSummaryDto>>('/incidents', {
      params: { ...statsQuery(rest), status: status && toStatusDto(status), orderId, page, size },
    })
    return fromSpringPage(data, toIncidentSummary)
  },

  stats: async (params: IncidentStatsParams) =>
    toIncidentStats(
      (await httpClient.get<IncidentStatsDto>('/incidents/stats', { params: statsQuery(params) }))
        .data,
    ),

  get: async (id: number) =>
    toIncidentDetail((await httpClient.get<IncidentDetailDto>(`/incidents/${id}`)).data),

  create: async (dto: SaveIncidentRequestDto) =>
    toIncidentDetail((await httpClient.post<IncidentDetailDto>('/incidents', dto)).data),

  update: async (id: number, dto: SaveIncidentRequestDto) =>
    toIncidentDetail((await httpClient.put<IncidentDetailDto>(`/incidents/${id}`, dto)).data),

  approve: async (id: number, dto: ApproveIncidentRequestDto) =>
    toIncidentDetail(
      (await httpClient.post<IncidentDetailDto>(`/incidents/${id}/approve`, dto)).data,
    ),

  reject: async (id: number, note: string) =>
    toIncidentDetail(
      (await httpClient.post<IncidentDetailDto>(`/incidents/${id}/reject`, { note })).data,
    ),

  payout: async (id: number, method: PayoutMethod) =>
    toIncidentDetail(
      (await httpClient.post<IncidentDetailDto>(`/incidents/${id}/payout`, { method })).data,
    ),
}
