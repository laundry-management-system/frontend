import { SimpleGrid } from '@mantine/core'
import { METRIC_INFO, type OrderReport, periodDelta } from '@/features/admin/reports'
import { InfoLabel, StatTile } from '@/shared/admin/ui'
import { formatNumber, formatOneDecimal } from '@/shared/common/lib/format'

interface OrderKpisProps {
  report?: OrderReport
}

export function OrderKpis({ report }: OrderKpisProps) {
  const n = (v: number | undefined) => (report && v !== undefined ? formatNumber(v) : '')
  const s = report?.summary
  const received = s && report ? periodDelta(s.totalOrders, report.previous.totalOrders) : undefined
  const lateRate =
    s && s.lateRatePercent !== null
      ? `Tỉ lệ trễ ${formatOneDecimal(s.lateRatePercent)}%`
      : undefined

  return (
    <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }} spacing="md" mb="lg">
      <StatTile
        label={<InfoLabel info={METRIC_INFO.received}>Đơn nhận</InfoLabel>}
        value={n(s?.totalOrders)}
        {...received}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.delivered}>Đã giao</InfoLabel>}
        value={n(s?.deliveredOrders)}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.processing}>Đang xử lý</InfoLabel>}
        value={n(s?.activeOrders)}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.cancelled}>Đã hủy</InfoLabel>}
        value={n(s?.cancelledOrders)}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.lateByPeriod}>Đơn trễ trong kỳ</InfoLabel>}
        value={n(s?.lateOrders)}
        delta={lateRate}
        trend={s && s.lateOrders > 0 ? 'down' : 'flat'}
      />
    </SimpleGrid>
  )
}
