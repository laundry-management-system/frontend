import { Group, SimpleGrid } from '@mantine/core'
import {
  LuPackage,
  LuReceiptText,
  LuTrendingDown,
  LuTrendingUp,
  LuTriangleAlert,
  LuWallet,
} from 'react-icons/lu'
import { type Dashboard, type DashboardPreset, delta } from '@/features/reports'
import { formatMoney, formatNumber } from '@/shared/lib/format'
import { KpiCard } from './KpiCard'
import { PATHS } from '@/shared/config/paths'

const COMPARE_LABEL: Record<DashboardPreset, string> = {
  today: 'so với hôm qua',
  '7d': 'so với 7 ngày trước',
  month: 'so với cùng kỳ trước',
}

interface KpiRowProps {
  data: Dashboard
  preset: DashboardPreset
  onStoredClick: () => void
}

function Delta({
  curr,
  prev,
  format,
  label,
}: {
  curr: number
  prev: number
  format: (n: number) => string
  label: string
}) {
  const { diff, trend } = delta(curr, prev)
  if (trend === 'flat') return <>Bằng kỳ trước</>
  const Icon = trend === 'up' ? LuTrendingUp : LuTrendingDown
  const color = trend === 'up' ? 'var(--tone-success-fg)' : 'var(--tone-danger-fg)'
  return (
    <Group gap={4} wrap="nowrap">
      <Icon size={14} color={color} aria-hidden />
      <span style={{ color }}>
        {trend === 'up' ? '+' : '−'}
        {format(Math.abs(diff))}
      </span>
      <span>{label}</span>
    </Group>
  )
}

export function KpiRow({ data, preset, onStoredClick }: KpiRowProps) {
  const { orders, revenue, alerts, previous } = data
  const compare = COMPARE_LABEL[preset]
  const late = alerts.lateOrders
  const stored = alerts.storedOrders

  const receivedNote = (
    <Group gap={6} wrap="nowrap">
      <Delta
        curr={orders.received}
        prev={previous.received}
        format={formatNumber}
        label={compare}
      />
      {orders.cancelled > 0 && <span>· {formatNumber(orders.cancelled)} đã hủy</span>}
    </Group>
  )

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
      <KpiCard
        icon={<LuReceiptText size={16} />}
        label="Đơn nhận"
        value={formatNumber(orders.received)}
        note={receivedNote}
        to={PATHS.orders}
      />
      <KpiCard
        icon={<LuWallet size={16} />}
        label="Doanh thu đã thu"
        value={formatMoney(revenue.total)}
        note={
          <Delta
            curr={revenue.total}
            prev={previous.revenueTotal}
            format={formatMoney}
            label={compare}
          />
        }
      />
      <KpiCard
        icon={<LuTriangleAlert size={16} />}
        label="Đơn đang trễ"
        value={formatNumber(late)}
        note={late > 0 ? 'Quá giờ hẹn, cần xử lý ngay' : 'Không có đơn trễ'}
        tone={late > 0 ? 'danger' : 'neutral'}
        to={`${PATHS.workList}?status=LATE`}
      />
      <KpiCard
        icon={<LuPackage size={16} />}
        label="Đồ tồn chưa nhận"
        value={formatNumber(stored)}
        note={`Quá ${alerts.storedAfterDays} ngày khách chưa lấy`}
        tone={stored > 0 ? 'warning' : 'neutral'}
        onClick={onStoredClick}
      />
    </SimpleGrid>
  )
}
