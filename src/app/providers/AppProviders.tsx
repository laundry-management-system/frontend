import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { refreshOnce, restoreSession, useAuthStore } from '@/features/auth'
import { configureHttpAuth } from '@/shared/api/httpClient'
import { notify } from '@/shared/lib/notify'
import { cssVariablesResolver, theme } from '../theme'
import { queryClient } from './queryClient'

configureHttpAuth({
  getToken: () => useAuthStore.getState().token,
  refresh: refreshOnce,
  // ProtectedRoute tự đưa về /login và giữ trang đang mở trong state.from
  onUnauthorized: () => {
    if (useAuthStore.getState().status !== 'authenticated') return
    useAuthStore.getState().clear()
    queryClient.clear()
    notify.info('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
  },
})

void restoreSession()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
    >
      <Notifications position="top-center" autoClose={4000} />
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </MantineProvider>
  )
}
