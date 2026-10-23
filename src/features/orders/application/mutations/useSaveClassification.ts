import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/features/documents'
import { ordersApi } from '../../data/ordersApi'
import type { OrderLine } from '../../domain/types'
import { orderKeys } from '../queryKeys'

interface SaveArgs {
  orderId: number
  items: { line: OrderLine; expressSurcharge: number }[]
  discountAmount?: number
}

/**
 * "Lưu & bắt đầu xử lý": lưu dòng đồ, tải ảnh tình trạng lên documents và gắn vào dòng vừa lưu,
 * rồi chuyển đơn sang Đang xử lý (research R8). Ảnh lỗi không chặn chuyển trạng thái: trả về
 * `failedImages` để màn hình báo, dữ liệu dòng đồ đã lưu không mất.
 */
export function useSaveClassification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, items, discountAmount }: SaveArgs) => {
      const saved = await ordersApi.updateItems(orderId, items, discountAmount)
      let failedImages = 0
      // BE giữ đúng thứ tự dòng gửi lên nên ghép ảnh theo vị trí
      for (const [i, { line }] of items.entries()) {
        const itemId = saved.items[i]?.id
        for (const file of line.localImages) {
          try {
            if (!itemId) throw new Error('Không tìm thấy dòng vừa lưu')
            const doc = await documentsApi.upload(file)
            await ordersApi.attachItemImage(orderId, itemId, doc.id)
          } catch {
            failedImages++
          }
        }
      }
      try {
        const order = await ordersApi.changeStatus(orderId, 'PROCESSING', 'Phân loại xong')
        return { order, failedImages }
      } catch {
        throw new Error('Đã lưu dòng đồ nhưng chưa chuyển sang Đang xử lý – vui lòng thử lại')
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
