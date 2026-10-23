import { useMutation } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'

/**
 * Soạn tin nhắn khách (BE ghi nhận thời điểm + số lần nhắn), chép tin vào clipboard rồi mở Zalo/SMS.
 * Zalo deep link không điền sẵn tin nên phải chép trước (handoff 008 #6d).
 */
export function useComposeNotification() {
  return useMutation({
    mutationFn: ({ orderCode, channel }: { orderCode: string; channel: 'ZALO' | 'SMS' }) =>
      ordersApi.composeNotification(orderCode, channel),
    onSuccess: async (result) => {
      try {
        await navigator.clipboard.writeText(result.message)
      } catch {
        // Trình duyệt chặn clipboard: tin vẫn hiện trong modal để chép tay
      }
      window.open(result.deepLink, '_blank', 'noopener')
    },
  })
}
