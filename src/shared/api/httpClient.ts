import axios from 'axios'
import { env } from '@/shared/config/env'
import { toApiError } from './apiError'

interface AuthBridge {
  getToken: () => string | null
  onUnauthorized: () => void
}

// shared không import feature auth; app/ nối auth vào đây qua configureHttpAuth()
let auth: AuthBridge = { getToken: () => null, onUnauthorized: () => {} }

export function configureHttpAuth(bridge: AuthBridge) {
  auth = bridge
}

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
  (error) => {
    const apiError = toApiError(error)
    // shortcut: BE chưa có refresh token nên 401 thì đăng xuất; thêm gọi /auth/refresh + retry khi BE hỗ trợ.
    if (apiError.status === 401) auth.onUnauthorized()
    return Promise.reject(apiError)
  },
)
