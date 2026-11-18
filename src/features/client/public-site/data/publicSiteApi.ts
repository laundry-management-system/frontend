import { httpClient } from '@/shared/common/api/httpClient'

// Trả dữ liệu thô; application parse bằng zod vì đây là API công khai không đăng nhập
export const publicSiteApi = {
  store: async () => (await httpClient.get<unknown>('/public/store')).data,
  services: async () => (await httpClient.get<unknown>('/public/services')).data,
  serviceAreas: async () => (await httpClient.get<unknown>('/public/service-areas')).data,
}
