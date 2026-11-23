import { SimpleGrid } from '@mantine/core'
import { LuCircleAlert, LuClipboardList, LuUserPlus, LuWallet } from 'react-icons/lu'
import {
  METRIC_INFO,
  periodDelta,
  type OverviewReport,
  type ReportPeriod,
} from '@/features/admin/reports'
import { InfoLabel } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'
import { formatMoney, formatNumber } from '@/shared/common/lib/format'
import { KpiCard } from './KpiCard'

function Delta({ cur, prev, inverse, money }: DeltaProps) {
  const { delta, trend } = periodDelta(cur, prev, inverse, money)
  const color =
    trend === 'up'
      ? 'var(--tone-success-fg)'
      : trend === 'down'
        ? 'var(--tone-danger-fg)'
        : undefined
  return <span style={{ color }}>{delta}</span>
}

interface DeltaProps {
  cur: number
  prev: number
  inverse?: boolean
  money?: boolean
}

interface KpiRowProps {
  data: OverviewReport
  period: ReportPeriod
}

/** 4 thẻ theo kỳ; mỗi thẻ dẫn tới báo cáo chủ, mang theo from,to,mode. */
export function KpiRow({ data, period }: KpiRowProps) {
  const { period: cur, previous: prev } = data
  const q = `?${new URLSearchParams({ from: period.from, to: period.to, mode: period.mode })}`
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
      <KpiCard
        icon={<LuClipboardList size={16} />}
        label={<InfoLabel info={METRIC_INFO.received}>Đơn nhận</InfoLabel>}
        value={formatNumber(cur.receivedOrders)}
        note={<Delta cur={cur.receivedOrders} prev={prev.receivedOrders} />}
        to={PATHS.reportOrders + q}
      />
      <KpiCard
        icon={<LuWallet size={16} />}
        label={<InfoLabel info={METRIC_INFO.revenue}>Doanh thu thực thu</InfoLabel>}
        value={formatMoney(cur.revenueTotal)}
        note={<Delta cur={cur.revenueTotal} prev={prev.revenueTotal} money />}
        to={PATHS.reportRevenue + q}
      />
      <KpiCard
        icon={<LuUserPlus size={16} />}
        label={<InfoLabel info={METRIC_INFO.newCustomers}>Khách mới</InfoLabel>}
        value={formatNumber(cur.newCustomers)}
        note={<Delta cur={cur.newCustomers} prev={prev.newCustomers} />}
        to={PATHS.reportCustomers + q}
      />
      <KpiCard
        icon={<LuCircleAlert size={16} />}
        label={<InfoLabel info={METRIC_INFO.incidents}>Sự cố mới</InfoLabel>}
        value={formatNumber(cur.newIncidents)}
        note={<Delta cur={cur.newIncidents} prev={prev.newIncidents} inverse />}
        to={PATHS.reportOperations + q}
      />
    </SimpleGrid>
  )
}
