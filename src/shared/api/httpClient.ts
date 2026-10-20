import axios, { type InternalAxiosRequestConfig, isAxiosError } from 'axios'
import { env } from '@/shared/config/env'
import { toApiError } from './apiError'

interface AuthBridge {
  getToken: () => string | null
  /** Lấy access token mới; null nếu phiên đã hết. */
  refresh: () => Promise<string | null>
  onUnauthorized: () => void
}

// shared không import feature auth; app/ nối auth vào đây qua configureHttpAuth()
let auth: AuthBridge = { getToken: () => null, refresh: async () => null, onUnauthorized: () => {} }

export function configureHttpAuth(bridge: AuthBridge) {
  auth = bridge
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export const httpClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15_000,
})

httpClient.interceptors.request.use((config) => {
  const token = auth.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = toApiError(error)
    const config = isAxiosError(error) ? (error.config as RetryConfig | undefined) : undefined
    // /auth/* tự xử lý 401 (sai mật khẩu, refresh hết hạn) nên không refresh lại
    if (apiError.status === 401 && config && !config.url?.startsWith('/auth/')) {
      if (!config._retry) {
        config._retry = true
        const token = await auth.refresh()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          return httpClient(config)
        }
      }
      // Refresh thất bại, hoặc request đã retry vẫn 401. Chỉ xoá phiên nếu request này dùng
      // đúng token hiện tại (tránh xoá phiên của người vừa đăng nhập lại trong lúc chờ)
      if (config.headers.Authorization === `Bearer ${auth.getToken()}`) auth.onUnauthorized()
    }
    return Promise.reject(apiError)
  },
)
