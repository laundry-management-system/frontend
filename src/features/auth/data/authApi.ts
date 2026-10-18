import { httpClient } from '@/shared/api/httpClient'
import type { AuthenticationResponseDto, LoginRequestDto } from './dto'

// Cookie refresh_token (path /api/auth) phải đi kèm khi FE gọi BE khác origin
const withCookie = { withCredentials: true }

export const authApi = {
  login: async (dto: LoginRequestDto) =>
    (await httpClient.post<AuthenticationResponseDto>('/auth/login', dto, withCookie)).data
      .accessToken,
  refresh: async () =>
    (await httpClient.post<AuthenticationResponseDto>('/auth/refresh', null, withCookie)).data
      .accessToken,
  logout: async () => {
    await httpClient.post('/auth/logout', null, withCookie)
  },
}
