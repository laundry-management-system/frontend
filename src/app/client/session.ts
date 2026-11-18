import {
  clearCustomerSession,
  refreshCustomerOnce,
  restoreCustomerSession,
  useCustomerSessionStore,
} from '@/features/client/customer-account'
import { configureCustomerHttpAuth } from '@/shared/common/api/httpClient'
import { notify } from '@/shared/common/lib/notify'

configureCustomerHttpAuth({
  getToken: () => useCustomerSessionStore.getState().token,
  refresh: refreshCustomerOnce,
  // CustomerRoute tự đưa về trang đăng nhập khách và giữ trang đang mở trong state.from
  onUnauthorized: () => {
    if (useCustomerSessionStore.getState().status !== 'authenticated') return
    clearCustomerSession()
    notify.info('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
  },
})

void restoreCustomerSession()
