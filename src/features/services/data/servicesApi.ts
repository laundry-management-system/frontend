import { httpClient } from '@/shared/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/api/page'
import type { ServiceStatus } from '../domain/types'
import type { CreateServiceRequestDto, ServiceResponseDto, UpdateServiceRequestDto } from './dto'
import { toService } from './mapper'

export interface ServiceListParams {
  search?: string
  status?: ServiceStatus
  page: number
  size: number
}

export const servicesApi = {
  list: async ({ search, status, page, size }: ServiceListParams) => {
    const { data } = await httpClient.get<SpringPage<ServiceResponseDto>>('/services', {
      params: { search: search || undefined, status, page, size },
    })
    return fromSpringPage(data, toService)
  },

  listActive: async () =>
    (await httpClient.get<ServiceResponseDto[]>('/services/active')).data.map(toService),

  create: async (dto: CreateServiceRequestDto) =>
    toService((await httpClient.post<ServiceResponseDto>('/services', dto)).data),

  update: async (id: number, dto: UpdateServiceRequestDto) =>
    toService((await httpClient.put<ServiceResponseDto>(`/services/${id}`, dto)).data),
}
