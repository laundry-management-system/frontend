import { Button, Select, Stack, Text, TextInput, VisuallyHidden } from '@mantine/core'
import type { ChangeEvent, ReactNode } from 'react'
import { LuReceiptText, LuSearch, LuSearchX } from 'react-icons/lu'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  isUnclassified,
  ORDER_CHANNEL_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  type OrderListItem,
  OrderChannelBadge,
  OrderPaymentBadge,
  OrderStatusCell,
  useOrderCounts,
  useOrders,
} from '@/features/admin/orders'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import { formatDateTime, formatPhone } from '@/shared/common/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  ListPage,
  Money,
  FILTER_SELECT_PROPS,
} from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

/** Trễ = quá hạn hẹn trả (isOverdue, đơn đang xử lý); quá giờ hẹn = chưa nhận đồ mà đã qua giờ hẹn gửi (loại trừ nhau). */
const isLate = (o: OrderListItem) => o.isOverdue || o.appointmentOverdue
const LateText = ({
  late,
  hint,
  children,
}: {
  late: boolean
  hint: string
  children: ReactNode
}) => (
  <Text
    inherit
    fw={late ? 700 : undefined}
    c={late ? 'red' : undefined}
    style={{ whiteSpace: 'nowrap' }}
  >
    {children}
    {late && <VisuallyHidden> ({hint})</VisuallyHidden>}
  </Text>
)
const NoWrap = ({ children }: { children: string }) => (
  <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
)
const shortDateTime = (iso: string) => formatDateTime(iso).slice(0, 16)
const CHANNELS = ['ONLINE', 'OFFLINE'] as const

export default function OrdersPage() {
  const navigate = useNavigate()
  const { q, setQ, search, status, setStatus, page, setPage, filtered } =
    useListParams(ORDER_STATUSES)
  const [params, setParams] = useSearchParams()
  const rawChannel = params.get('channel')
  const channel = CHANNELS.find((c) => c === rawChannel)
  const { data, isLoading, isError, refetch } = useOrders({
    status: status === 'ALL' ? undefined : status,
    channel,
    q: search,
    page: page - 1,
  })
  const { data: counts } = useOrderCounts()
  const total = data?.page.totalElements ?? 0
  const open = (o: OrderListItem) => navigate(PATHS.orderDetail(o.id))
  const withCount = (label: string, n: number | undefined) =>
    n == null ? label : `${label} (${n})`

  const goIntake = () => navigate(PATHS.intake)
  const handleRetry = () => refetch()
  const rowKey = (o: OrderListItem) => o.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleChannelChange = (v: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (!v || v === 'ALL') next.delete('channel')
        else next.set('channel', v)
        next.delete('page')
        return next
      },
      { replace: true },
    )
  const handleReset = () => {
    setQ('')
    setParams({}, { replace: true })
  }
  const handleStatusChange = (v: string | null) => setStatus(v as typeof status)

  const primaryAction = { label: 'Tạo đơn', onClick: goIntake }

  const statusOptions = [
    { label: `Trạng thái: ${withCount('Tất cả', counts?.ALL)}`, value: 'ALL' },
    ...ORDER_STATUSES.map((s) => ({
      label: `Trạng thái: ${withCount(ORDER_STATUS_LABEL[s], counts?.[s])}`,
      value: s,
    })),
  ]

  const channelOptions = [
    { label: 'Kênh: Tất cả', value: 'ALL' },
    ...CHANNELS.map((c) => ({ label: `Kênh: ${ORDER_CHANNEL_LABEL[c]}`, value: c })),
  ]

  const filters = (
    <>
      <Select
        {...FILTER_SELECT_PROPS}
        w={300}
        value={status}
        onChange={handleStatusChange}
        data={statusOptions}
        allowDeselect={false}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={220}
        value={channel ?? 'ALL'}
        onChange={handleChannelChange}
        data={channelOptions}
        allowDeselect={false}
      />
      <TextInput
        w={320}
        placeholder="Mã đơn / tên / SĐT"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
      />
    </>
  )

  const columns: DataTableColumn<OrderListItem>[] = [
    {
      name: 'code',
      label: 'Mã đơn',
      width: 170,
      fixed: 'left',
      render: (o) => <CopyableCode code={o.orderCode} />,
    },
    {
      name: 'channel',
      label: 'Kênh',
      width: 100,
      render: (o) => <OrderChannelBadge channel={o.channel} />,
    },
    {
      name: 'washMode',
      label: 'Hình thức',
      width: 150,
      render: (o) => (
        <>
          <Text size="sm">{o.washModeName}</Text>
          {o.washWhitesSeparately && (
            <Text size="xs" c="dimmed">
              + Đồ trắng
            </Text>
          )}
        </>
      ),
    },
    {
      name: 'customer',
      label: 'Khách hàng',
      width: 260,
      fixed: 'left',
      render: (o) => (
        <Stack gap={0}>
          <Text fw={500} truncate="end" maw={236} title={o.customerName}>
            {o.customerName}
          </Text>
          <Text
            size="sm"
            c="dimmed"
            style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
          >
            {formatPhone(o.customerPhone)}
          </Text>
        </Stack>
      ),
    },
    {
      name: 'createdAt',
      label: 'Tạo lúc',
      width: 160,
      render: (o) => (o.createdAt ? <NoWrap>{shortDateTime(o.createdAt)}</NoWrap> : ''),
    },
    {
      name: 'schedule',
      label: 'Hẹn – trả',
      width: 210,
      render: (o) => (
        <Stack gap={2}>
          {o.appointmentAt && (
            <LateText late={o.appointmentOverdue} hint="quá giờ hẹn lấy/gửi đồ">
              Hẹn: {shortDateTime(o.appointmentAt)}
            </LateText>
          )}
          {o.dueAt && (
            <LateText late={o.isOverdue} hint="trễ hẹn trả">
              Trả: {shortDateTime(o.dueAt)}
            </LateText>
          )}
        </Stack>
      ),
    },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 130,
      render: (o) => (
        <Stack gap={6} align="flex-start">
          <OrderStatusCell status={o.status} />
        </Stack>
      ),
    },
    {
      name: 'payment',
      label: 'Thanh toán',
      width: 130,
      render: (o) =>
        o.status === 'CANCELLED' ? (
          <Text c="dimmed">—</Text>
        ) : (
          <OrderPaymentBadge
            status={o.status}
            paymentStatus={o.paymentStatus}
            paymentClaimedAt={o.paymentClaimedAt}
          />
        ),
    },
    {
      name: 'total',
      label: 'Phải thu',
      width: 110,
      render: (o) =>
        o.status === 'CANCELLED' ? (
          <Text c="dimmed">0đ</Text>
        ) : isUnclassified(o) ? (
          <Text c="dimmed">—</Text>
        ) : (
          <Money value={o.payableAmount} />
        ),
    },
  ]

  const rowProps = (o: OrderListItem) => ({
    onClick: () => open(o),
    className: isLate(o) ? 'ds-row-late' : undefined,
    style: { cursor: 'pointer', opacity: o.status === 'CANCELLED' ? 0.6 : undefined },
  })

  const empty =
    filtered || !!channel ? (
      <EmptyState
        icon={<LuSearchX size={32} />}
        title="Không tìm thấy đơn"
        description={
          search.trim()
            ? `Không có đơn nào khớp "${search.trim()}".`
            : 'Không có đơn nào ở trạng thái này.'
        }
        action={
          <Button variant="secondary" onClick={handleReset}>
            Xóa lọc
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={<LuReceiptText size={32} />}
        title="Chưa có đơn hàng"
        description="Đơn tiếp nhận sẽ hiện ở đây."
        action={<Button onClick={goIntake}>Tạo đơn</Button>}
      />
    )

  return (
    <ListPage<OrderListItem>
      title="Đơn hàng"
      description={`${total.toLocaleString('vi-VN')} đơn`}
      primaryAction={primaryAction}
      filters={filters}
      columns={columns}
      data={data?.content ?? []}
      rowKey={rowKey}
      loading={isLoading}
      error={isError}
      onRetry={handleRetry}
      rowProps={rowProps}
      page={page}
      totalPages={data?.page.totalPages ?? 0}
      onPageChange={setPage}
      empty={empty}
    />
  )
}
