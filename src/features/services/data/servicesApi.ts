import { httpClient } from '@/shared/api/httpClient'
import type { ServiceStatus } from '../domain/types'
import type { CreateServiceRequestDto, ServiceResponseDto, UpdateServiceRequestDto } from './dto'
import { toService } from './mapper'

export const servicesApi = {
  // Không truyền activeOnly: bảng giá hiện cả dịch vụ ngừng hoạt động
  list: async () => (await httpClient.get<ServiceResponseDto[]>('/services')).data.map(toService),

  create: async (dto: CreateServiceRequestDto) =>
    toService((await httpClient.post<ServiceResponseDto>('/services', dto)).data),

  update: async (id: number, dto: UpdateServiceRequestDto) =>
    toService((await httpClient.put<ServiceResponseDto>(`/services/${id}`, dto)).data),

  changeStatus: async (id: number, status: ServiceStatus) =>
    toService(
      (await httpClient.patch<ServiceResponseDto>(`/services/${id}/status`, { status })).data,
    ),
}
