import {
  Box,
  Button,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Title,
} from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { LuCloudOff, LuRefreshCw } from 'react-icons/lu'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  type DashboardPreset,
  PaymentSplit,
  presetRange,
  RevenueBars,
  useDailyRevenue,
  useDashboard,
} from '@/features/reports'
import { EmptyState, IconButton, PageHeader } from '@/shared/ui'
import { DueSoonCard } from './components/DueSoonCard'
import { KpiRow } from './components/KpiRow'
import { OrderFlow } from './components/OrderFlow'
import { StoredOrdersCard } from './components/StoredOrdersCard'
import { PATHS } from '@/shared/config/paths'

const PRESETS: { value: DashboardPreset; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: 'month', label: 'Tháng này' },
]
const KPI_SKELETONS = [0, 1, 2, 3]

const isPreset = (v: string | null): v is DashboardPreset => PRESETS.some((p) => p.value === v)
const fmt = (d: string) => dayjs(d).format('DD/MM/YYYY')

export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const rawPeriod = params.get('period')
  const preset: DashboardPreset = isPreset(rawPeriod) ? rawPeriod : 'today'
  const today = dayjs().format('YYYY-MM-DD')
  const range = presetRange(preset, today)

  const dashboard = useDashboard(range)
  const revenue = useDailyRevenue(today)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data } = dashboard

  const handlePresetChange = (v: string) =>
    setParams(v === 'today' ? {} : { period: v }, { replace: true })
  // Làm mới mọi khối trên trang, kể cả hai bảng đơn tự tải dữ liệu riêng
  const refreshAll = () => queryClient.invalidateQueries()
  const handleRetry = () => dashboard.refetch()
  const retryRevenue = () => revenue.refetch()
  const openStored = () => navigate(PATHS.ordersStored)

  const rangeText =
    range.from === range.to ? fmt(range.to) : `${fmt(range.from)} – ${fmt(range.to)}`
  const description = dashboard.dataUpdatedAt
    ? `${rangeText} · cập nhật ${dayjs(dashboard.dataUpdatedAt).format('HH:mm')}`
    : rangeText

  const headerActions = (
    <Group gap="xs">
      <SegmentedControl value={preset} onChange={handlePresetChange} data={PRESETS} />
      <IconButton label="Làm mới" icon={<LuRefreshCw size={16} />} onClick={refreshAll} />
    </Group>
  )

  const summary = dashboard.isError ? (
    <Card mb="lg">
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được số liệu"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={<Button onClick={handleRetry}>Thử lại</Button>}
      />
    </Card>
  ) : data ? (
    <>
      <KpiRow data={data} preset={preset} onStoredClick={openStored} />
      <OrderFlow orders={data.orders} preset={preset} />
    </>
  ) : (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
      {KPI_SKELETONS.map((i) => (
        <Skeleton key={i} h={110} radius="md" />
      ))}
    </SimpleGrid>
  )

  const revenueBody = revenue.isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được doanh thu"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={retryRevenue}>Thử lại</Button>}
    />
  ) : revenue.data ? (
    <RevenueBars rows={revenue.data} />
  ) : (
    <Skeleton h={200} />
  )

  // Cùng nguồn với KPI: lỗi tải thì không hiện số cũ
  const paymentBody = dashboard.isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được số liệu"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
    />
  ) : data ? (
    <PaymentSplit summary={data.revenue} />
  ) : (
    <Skeleton h={140} />
  )

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description={description}
        info="Đơn trễ và đồ tồn là số hiện tại. Các số còn lại tính theo kỳ đã chọn, so với kỳ liền trước cùng số ngày."
        actions={headerActions}
      />
      {summary}
      <Group align="stretch" gap="lg" mb="lg" wrap="wrap">
        <Card style={{ flex: '1 1 480px', minWidth: 0 }}>
          <Title order={5} mb="md">
            Doanh thu 14 ngày gần nhất
          </Title>
          {revenueBody}
        </Card>
        <Card style={{ flex: '0 1 360px' }}>
          <Title order={5} mb="md">
            Theo phương thức thanh toán
          </Title>
          {paymentBody}
        </Card>
      </Group>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Box>
          <DueSoonCard />
        </Box>
        <Box>
          <StoredOrdersCard />
        </Box>
      </SimpleGrid>
    </>
  )
}
