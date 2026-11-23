import { SimpleGrid } from '@mantine/core'
import { growth, METRIC_INFO, periodDelta, type RevenueReport } from '@/features/admin/reports'
import { InfoLabel, StatTile } from '@/shared/admin/ui'
import { formatMoney, formatNumber, formatOneDecimal } from '@/shared/common/lib/format'

export function RevenueKpis({ report }: { report?: RevenueReport }) {
  const total = report?.summary.total ?? 0
  const paid = report?.summary.paidOrders ?? 0
  const prev = report?.previous
  const g = prev ? growth(total, prev.total) : null
  const sign = !g || g.diff === 0 ? '' : g.diff > 0 ? '+' : '−'
  const growthText = !g
    ? ''
    : g.noCompare
      ? 'Không có dữ liệu so sánh'
      : `${sign}${formatOneDecimal(Math.abs(g.pct ?? 0))}%`
  const trend = !g || g.diff === 0 ? 'flat' : g.diff > 0 ? 'up' : 'down'
  const prevPaid = prev?.paidOrders ?? 0
  const paidCmp = prev ? periodDelta(paid, prevPaid) : undefined

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
      <StatTile
        label={<InfoLabel info={METRIC_INFO.revenue}>Tổng doanh thu</InfoLabel>}
        value={report ? formatMoney(total) : ''}
        delta={prev ? `Kỳ trước ${formatMoney(prev.total)}` : undefined}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.growth}>Tăng trưởng</InfoLabel>}
        value={report ? growthText : ''}
        trend={trend}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.paidOrders}>Số đơn đã thanh toán</InfoLabel>}
        value={report ? formatNumber(paid) : ''}
        {...paidCmp}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.avgOrderValue}>Giá trị đơn trung bình</InfoLabel>}
        value={report ? (paid === 0 ? '—' : formatMoney(Math.round(total / paid))) : ''}
      />
    </SimpleGrid>
  )
}
