import { SimpleGrid } from '@mantine/core'
import {
  avgOrderValue,
  type Dashboard,
  growthPct,
  type RevenueReport,
} from '@/features/admin/reports'
import { formatMoney, formatNumber } from '@/shared/common/lib/format'
import { StatTile } from '@/shared/admin/ui'

const pct = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

interface RevenueKpisProps {
  report?: RevenueReport
  dashboard?: Dashboard
}

export function RevenueKpis({ report, dashboard }: RevenueKpisProps) {
  const total = report?.summary.total ?? 0
  const count = report?.summary.paymentCount ?? 0
  const prev = dashboard?.previous.revenueTotal
  const growth = report && prev !== undefined ? growthPct(total, prev) : null
  const growthText =
    growth === null
      ? '—'
      : `${growth > 0 ? '+' : growth < 0 ? '−' : ''}${pct.format(Math.abs(growth))}%`
  const growthTrend = growth === null || growth === 0 ? 'flat' : growth > 0 ? 'up' : 'down'

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
      <StatTile
        label="Tổng doanh thu"
        value={report ? formatMoney(total) : ''}
        delta={prev !== undefined ? `Kỳ trước ${formatMoney(prev)}` : undefined}
      />
      <StatTile
        label="Tăng trưởng"
        value={report && dashboard ? growthText : ''}
        trend={growthTrend}
      />
      <StatTile
        label="Số đơn đã thanh toán"
        value={report ? formatNumber(count) : ''}
        delta={dashboard ? `Tổng số đơn ${formatNumber(dashboard.orders.received)}` : undefined}
      />
      <StatTile
        label="Giá trị đơn trung bình"
        value={report ? formatMoney(avgOrderValue(total, count)) : ''}
      />
    </SimpleGrid>
  )
}
