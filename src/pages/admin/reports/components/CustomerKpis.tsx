import { SimpleGrid } from '@mantine/core'
import { type CustomerReport, METRIC_INFO, periodDelta } from '@/features/admin/reports'
import { InfoLabel, StatTile } from '@/shared/admin/ui'
import { formatNumber, formatOneDecimal } from '@/shared/common/lib/format'

export function CustomerKpis({ report }: { report?: CustomerReport }) {
  const n = (v: number | undefined) => (report && v !== undefined ? formatNumber(v) : '')
  const newDelta = report
    ? periodDelta(report.newCustomers, report.previous.newCustomers)
    : undefined
  const rate = report?.returnRatePercent
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
      <StatTile
        label={<InfoLabel info={METRIC_INFO.newCustomers}>Khách mới</InfoLabel>}
        value={n(report?.newCustomers)}
        {...newDelta}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.returningCustomers}>Khách quay lại</InfoLabel>}
        value={n(report?.returningCustomers)}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.returningRate}>Tỉ lệ quay lại</InfoLabel>}
        value={rate == null ? '' : `${formatOneDecimal(rate)}%`}
      />
      <StatTile
        label={<InfoLabel info={METRIC_INFO.onlineSignups}>Đăng ký online</InfoLabel>}
        value={n(report?.registrations)}
      />
    </SimpleGrid>
  )
}
