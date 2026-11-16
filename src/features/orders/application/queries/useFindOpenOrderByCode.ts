import { useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../../data/ordersApi'
import { exactCodeMatch } from '../../domain/workList'
import { orderKeys } from '../queryKeys'

/** Tìm đúng một đơn chưa hoàn thành theo mã đơn (LD-…) hoặc mã lượt nhận (NH-…), ví dụ khi quét QR liên phiếu. */
export function useFindOpenOrderByCode() {
  const queryClient = useQueryClient()

  const fetchCandidates = (code: string) => {
    // BE: `search` chỉ tìm theo mã đơn / tên; mã lượt nhận phải lọc qua `intakeCode`
    if (code.toUpperCase().startsWith('NH-')) {
      const params = { intakeCode: code, q: '', page: 0, size: 5 }
      return queryClient.fetchQuery({
        queryKey: orderKeys.list(params),
        queryFn: () => ordersApi.list(params),
      })
    }
    const params = { tab: 'ALL' as const, q: code, page: 0, size: 20 }
    return queryClient.fetchQuery({
      queryKey: orderKeys.work(params),
      queryFn: () => ordersApi.listWork(params),
    })
  }

  return async (rawCode: string) => {
    const code = rawCode.trim()
    const page = await fetchCandidates(code)
    const open = page.content.filter((o) => o.status === 'RECEIVED' || o.status === 'PROCESSING')
    return exactCodeMatch(open, code)
  }
}
