import { SimpleGrid } from '@mantine/core'
import type { OrderReport } from '@/features/admin/reports'
import { formatNumber } from '@/shared/common/lib/format'
import { StatTile } from '@/shared/admin/ui'

const pct = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

interface OrderKpisProps {
  report?: OrderReport
}

export function OrderKpis({ report }: OrderKpisProps) {
  const n = (v: number | undefined) => (report && v !== undefined ? formatNumber(v) : '')
  const s = report?.summary

  return (
    <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }} spacing="md" mb="lg">
      <StatTile label="Tổng số đơn" value={n(s?.activeOrders)} />
      <StatTile label="Đã giao" value={n(report?.delivered)} />
      <StatTile label="Đang xử lý" value={n(report?.processing)} />
      <StatTile
        label="Số đơn trễ"
        value={n(s?.lateOrders)}
        delta={s ? `Tỉ lệ trễ ${pct.format(s.lateRatePercent)}%` : undefined}
      />
      <StatTile label="Đã hủy" value={n(s?.cancelledOrders)} />
    </SimpleGrid>
  )
}
