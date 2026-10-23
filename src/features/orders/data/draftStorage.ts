import type { OrderLine, OrderType } from '../domain/types'

export interface OrderDraft {
  orderType: OrderType
  lines: Omit<OrderLine, 'localImages'>[]
  voucherCode: string | null
  savedAt: string
}

const keyOf = (orderId: number) => `orders.draft.${orderId}`

// shortcut: nháp chỉ lưu trên trình duyệt này; chuyển sang BE khi có cờ nháp (research R8)
export const draftStorage = {
  load(orderId: number): OrderDraft | null {
    try {
      const raw = localStorage.getItem(keyOf(orderId))
      return raw ? (JSON.parse(raw) as OrderDraft) : null
    } catch {
      return null
    }
  },
  save(orderId: number, draft: OrderDraft) {
    try {
      localStorage.setItem(keyOf(orderId), JSON.stringify(draft))
      return true
    } catch {
      return false
    }
  },
  clear(orderId: number) {
    try {
      localStorage.removeItem(keyOf(orderId))
    } catch {
      // không có quyền ghi storage: bỏ qua
    }
  },
}
