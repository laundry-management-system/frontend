import { httpClient } from '@/shared/common/api/httpClient'
import type { ActivateRegistrationResponseDto } from './dto'

export const registrationsApi = {
  pendingCount: async () =>
    (await httpClient.get<{ count: number }>('/customer-registrations/pending-count')).data.count,

  activate: async (id: number) =>
    (
      await httpClient.post<ActivateRegistrationResponseDto>(
        `/customer-registrations/${id}/activate`,
      )
    ).data,

  reject: async (id: number) => {
    await httpClient.post(`/customer-registrations/${id}/reject`)
  },
}
