import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../../data/servicesApi'
import { buildPricePeriods } from '../../domain/priceHistory'
import { UNIT_LABEL } from '../../domain/types'
import { serviceKeys } from '../queryKeys'
import { useServices } from './useServices'

// shortcut: giá hiện tại lấy từ trang đầu bảng giá (≤ 100 dịch vụ); ngoài trang đó thì dùng giá mới của lần đổi gần nhất
const SERVICE_QUERY = { search: '', page: 0, size: 100 }

/** Diễn biến đơn giá của một dịch vụ trên toàn bộ lịch sử (không theo bộ lọc ngày), dựng sẵn để hiển thị */
export function usePriceTimeline(serviceId: number) {
  const services = useServices(SERVICE_QUERY)
  const history = useQuery({
    queryKey: serviceKeys.priceTimeline(serviceId),
    queryFn: () => servicesApi.priceHistory({ serviceId, field: 'PRICE', page: 0, size: 1000 }),
  })

  const service = services.data?.content.find((s) => s.id === serviceId)
  // API trả mới nhất trước
  const latest = history.data?.content[0]
  const currentPrice = service?.price ?? (latest?.newValue != null ? Number(latest.newValue) : null)
  const unit = service?.unit ?? latest?.unit ?? null

  const refetch = () => {
    services.refetch()
    history.refetch()
  }

  return {
    currentPrice,
    unitLabel: unit ? UNIT_LABEL[unit] : null,
    timeline:
      history.data && currentPrice != null
        ? buildPricePeriods(history.data.content, currentPrice)
        : null,
    isLoading: history.isLoading || services.isLoading,
    isError: history.isError || services.isError,
    refetch,
  }
}
