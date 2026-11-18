import axios, { type InternalAxiosRequestConfig, isAxiosError } from 'axios'
import { env } from '@/shared/common/config/env'
import { toApiError } from './apiError'

interface AuthBridge {
  getToken: () => string | null
  /** Lấy access token mới; null nếu phiên đã hết. */
  refresh: () => Promise<string | null>
  onUnauthorized: () => void
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const noAuth: AuthBridge = {
  getToken: () => null,
  refresh: async () => null,
  onUnauthorized: () => {},
}

/** Mỗi client giữ một phiên riêng: nhân viên và khách có thể cùng đăng nhập trong một tab. */
function createApiClient(skipRefreshPrefix: string) {
  // shared không import feature; app/ nối phiên vào đây qua configure…HttpAuth()
  let auth = noAuth

  const client = axios.create({
    baseURL: env.VITE_API_URL,
    timeout: 15_000,
  })

  client.interceptors.request.use((config) => {
    const token = auth.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const apiError = toApiError(error)
      const config = isAxiosError(error) ? (error.config as RetryConfig | undefined) : undefined
      // API đăng nhập/refresh tự xử lý 401 (sai mật khẩu, refresh hết hạn) nên không refresh lại
      if (apiError.status === 401 && config && !config.url?.startsWith(skipRefreshPrefix)) {
        if (!config._retry) {
          config._retry = true
          const token = await auth.refresh()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
            return client(config)
          }
        }
        // Refresh thất bại, hoặc request đã retry vẫn 401. Chỉ xoá phiên nếu request này dùng
        // đúng token hiện tại (tránh xoá phiên của người vừa đăng nhập lại trong lúc chờ)
        if (config.headers.Authorization === `Bearer ${auth.getToken()}`) auth.onUnauthorized()
      }
      return Promise.reject(apiError)
    },
  )

  return {
    client,
    configure: (bridge: AuthBridge) => {
      auth = bridge
    },
  }
}

const staff = createApiClient('/auth/')
const customer = createApiClient('/customer-auth/')

export const httpClient = staff.client
export const configureHttpAuth = staff.configure

export const customerHttpClient = customer.client
export const configureCustomerHttpAuth = customer.configure
