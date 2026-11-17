import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { downloadCsv } from '@/shared/lib/csv'
import { notify } from '@/shared/lib/notify'
import { servicesApi } from '../data/servicesApi'
import { priceHistoryCsvName, priceHistoryCsvRows } from '../domain/priceHistory'
import type { PriceHistoryFilter } from '../domain/types'
import { serviceKeys } from './queryKeys'

// Giới hạn của API; lịch sử giá chỉ vài trăm dòng mỗi năm
const EXPORT_LIMIT = 1000

/** Xuất mọi dòng khớp bộ lọc (không chỉ trang đang xem) ra CSV */
export function useExportPriceHistory() {
  const queryClient = useQueryClient()
  const [exporting, setExporting] = useState(false)

  const exportCsv = async (filter: PriceHistoryFilter) => {
    const all = { ...filter, page: 0, size: EXPORT_LIMIT }
    setExporting(true)
    try {
      const data = await queryClient.fetchQuery({
        queryKey: serviceKeys.priceHistory(all),
        queryFn: () => servicesApi.priceHistory(all),
      })
      if (data.page.totalElements > EXPORT_LIMIT) {
        notify.error(`Kỳ lọc có hơn ${EXPORT_LIMIT} thay đổi, hãy thu hẹp khoảng ngày`)
        return
      }
      downloadCsv(priceHistoryCsvName(filter.from, filter.to), priceHistoryCsvRows(data.content))
    } catch {
      notify.error('Không xuất được file, vui lòng thử lại')
    } finally {
      setExporting(false)
    }
  }

  return { exportCsv, exporting }
}
