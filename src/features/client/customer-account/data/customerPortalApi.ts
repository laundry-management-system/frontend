import { type SpringPage, fromSpringPage } from '@/shared/common/api/page'
import { customerHttpClient } from '@/shared/common/api/httpClient'
import type {
  AuthenticationResponseDto,
  ChangeMyPasswordRequestDto,
  CustomerOrderDto,
  CustomerProfileDto,
  UpdateMyProfileRequestDto,
} from './dto'

export const customerPortalApi = {
  getMe: async () => (await customerHttpClient.get<CustomerProfileDto>('/customer-portal/me')).data,
  updateMe: async (dto: UpdateMyProfileRequestDto) =>
    (await customerHttpClient.put<CustomerProfileDto>('/customer-portal/me', dto)).data,
  // Đổi mật khẩu cấp cookie refresh mới nên cần withCredentials
  changePassword: async (dto: ChangeMyPasswordRequestDto) =>
    (
      await customerHttpClient.put<AuthenticationResponseDto>('/customer-portal/me/password', dto, {
        withCredentials: true,
      })
    ).data.accessToken,
  listOrders: async ({ page, size }: { page: number; size: number }) =>
    fromSpringPage(
      (
        await customerHttpClient.get<SpringPage<CustomerOrderDto>>('/customer-portal/orders', {
          params: { page, size },
        })
      ).data,
      (o) => ({ ...o }),
    ),
}
