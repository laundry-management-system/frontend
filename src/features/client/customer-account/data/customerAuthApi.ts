import { customerHttpClient } from '@/shared/common/api/httpClient'
import type { AuthenticationResponseDto, LoginRequestDto, RegisterRequestDto } from './dto'

// Cookie customer_refresh_token (path /api/customer-auth) phải đi kèm khi FE gọi BE khác origin
const withCookie = { withCredentials: true }

export const customerAuthApi = {
  register: async (dto: RegisterRequestDto) => {
    await customerHttpClient.post('/customer-auth/register', dto)
  },
  login: async (dto: LoginRequestDto) =>
    (
      await customerHttpClient.post<AuthenticationResponseDto>(
        '/customer-auth/login',
        dto,
        withCookie,
      )
    ).data.accessToken,
  refresh: async () =>
    (
      await customerHttpClient.post<AuthenticationResponseDto>(
        '/customer-auth/refresh',
        null,
        withCookie,
      )
    ).data.accessToken,
  logout: async () => {
    await customerHttpClient.post('/customer-auth/logout', null, withCookie)
  },
  forgotPassword: async (email: string) => {
    await customerHttpClient.post('/customer-auth/forgot-password', { email })
  },
  resetPassword: async (token: string, newPassword: string) => {
    await customerHttpClient.post('/customer-auth/reset-password', { token, newPassword })
  },
}
