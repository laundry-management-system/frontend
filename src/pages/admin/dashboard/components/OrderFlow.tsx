import { SimpleGrid } from '@mantine/core'
import { METRIC_INFO, type OverviewReport } from '@/features/admin/reports'
import { InfoLabel, StatTile } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'

/** Số đơn đang ở từng trạng thái tại thời điểm xem (nhãn "Hiện tại"). */
export function OrderFlow({ live }: { live: OverviewReport['live'] }) {
  const tiles = [
    ['Chờ xử lý', live.waiting],
    ['Đang xử lý', live.processing],
    ['Sẵn sàng trả', live.readyForPickup],
    ['Chờ xác nhận', live.pendingConfirmation],
    ['Chờ khách mang tới', live.awaitingDropoff],
  ] as const
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} mb="lg">
      {tiles.map(([label, n]) => (
        <StatTile key={label} label={`${label} (hiện tại)`} value={formatNumber(n)} />
      ))}
      <StatTile
        label={<InfoLabel info={METRIC_INFO.lateNow}>Đơn trễ hiện tại</InfoLabel>}
        value={formatNumber(live.lateOrders)}
      />
    </SimpleGrid>
  )
}
