import { create } from 'zustand'

type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

interface CustomerSessionState {
  status: SessionStatus
  token: string | null
  setSession: (token: string) => void
  clear: () => void
}

// Cờ gợi ý "máy này từng có phiên khách" để khách mới không phải gọi refresh (luôn 401) khi mở trang
const SESSION_HINT_KEY = 'laundry-has-customer-session'

function setSessionHint(on: boolean) {
  try {
    if (on) localStorage.setItem(SESSION_HINT_KEY, '1')
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch {
    // storage bị chặn: coi như không có cờ
  }
}

export function hasCustomerSessionHint() {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1'
  } catch {
    return false
  }
}

// Token chỉ giữ trong bộ nhớ; tải lại trang thì khôi phục bằng refresh cookie
export const useCustomerSessionStore = create<CustomerSessionState>()((set) => ({
  status: 'unknown',
  token: null,
  setSession: (token) => {
    setSessionHint(true)
    set({ status: 'authenticated', token })
  },
  clear: () => {
    setSessionHint(false)
    set({ status: 'anonymous', token: null })
  },
}))
