import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../../data/servicesApi'
import { buildPriceTimeline } from '../../domain/priceHistory'
import { priceFor } from '../../domain/rules'
import { UNIT_LABEL } from '../../domain/types'
import { serviceKeys } from '../queryKeys'
import { useServices } from './useServices'
import { useWashModes } from './useWashModes'

// shortcut: giá hiện tại lấy từ trang đầu bảng giá (≤ 100 dịch vụ); ngoài trang đó thì dùng giá mới của lần đổi gần nhất
const SERVICE_QUERY = { search: '', page: 0, size: 100 }

/** Mọi thay đổi của một dịch vụ trên toàn bộ lịch sử (không theo bộ lọc ngày), dựng sẵn để hiển thị */
export function usePriceTimeline(serviceId: number) {
  const services = useServices(SERVICE_QUERY)
  const modes = useWashModes()
  const history = useQuery({
    queryKey: serviceKeys.priceTimeline(serviceId),
    queryFn: () => servicesApi.priceHistory({ serviceId, page: 0, size: 1000 }),
  })

  const service = services.data?.content.find((s) => s.id === serviceId)
  const defaultModeId = modes.data?.find((m) => m.isDefault)?.id ?? null
  // API trả mới nhất trước; dòng PRICE cũ nối với giá hình thức mặc định
  const latest = history.data?.content.find(
    (r) =>
      (r.field === 'PRICE' || (r.field === 'MODE_PRICE' && r.washModeId === defaultModeId)) &&
      r.newValue != null,
  )
  const currentPrice =
    (service && defaultModeId != null ? priceFor(service, defaultModeId) : null) ??
    (latest ? Number(latest.newValue) : null)
  const unit = service?.unit ?? latest?.unit ?? null

  const refetch = () => {
    services.refetch()
    modes.refetch()
    history.refetch()
  }

  return {
    currentPrice,
    unitLabel: unit ? UNIT_LABEL[unit] : null,
    timeline:
      history.data && currentPrice != null
        ? buildPriceTimeline(history.data.content, currentPrice, defaultModeId)
        : null,
    isLoading: history.isLoading || services.isLoading || modes.isLoading,
    isError: history.isError || services.isError || modes.isError,
    refetch,
  }
}
