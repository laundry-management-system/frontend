import { refreshOnce, restoreSession, useAuthStore } from '@/features/admin/auth'
import { configureHttpAuth } from '@/shared/common/api/httpClient'
import { queryClient } from '@/shared/common/api/queryClient'
import { notify } from '@/shared/common/lib/notify'

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
