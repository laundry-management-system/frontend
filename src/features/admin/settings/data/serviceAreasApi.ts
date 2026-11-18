import { httpClient } from '@/shared/common/api/httpClient'
import type { ServiceArea } from '../domain/types'
import type { ServiceAreaRequestDto } from './dto'

// Response của BE trùng hình dạng với ServiceArea nên không cần mapper
export const serviceAreasApi = {
  list: async () => (await httpClient.get<ServiceArea[]>('/service-areas')).data,
  create: async (dto: ServiceAreaRequestDto) =>
    (await httpClient.post<ServiceArea>('/service-areas', dto)).data,
  update: async (id: number, dto: ServiceAreaRequestDto) =>
    (await httpClient.put<ServiceArea>(`/service-areas/${id}`, dto)).data,
  changeStatus: async (id: number, active: boolean) =>
    (await httpClient.patch<ServiceArea>(`/service-areas/${id}/status`, { active })).data,
}
