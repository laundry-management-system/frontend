import { Button, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import type { ChangeEvent } from 'react'
import { LuChevronRight, LuReceiptText, LuSearch, LuSearchX } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { formatPhone } from '@/features/customers'
import {
  isUnclassified,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  type OrderListItem,
  OrderStatusCell,
  useOrderCounts,
  useOrders,
} from '@/features/orders'
import { useListParams } from '@/shared/hooks/useListParams'
import { formatDateTime } from '@/shared/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  IconButton,
  ListPage,
  Money,
  StatusBadge,
} from '@/shared/ui'

const shortDateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

export default function OrdersPage() {
  const navigate = useNavigate()
  const { q, setQ, search, status, setStatus, page, setPage, filtered, reset } =
    useListParams(ORDER_STATUSES)
  const { data, isLoading, isError, refetch } = useOrders({
    status: status === 'ALL' ? undefined : status,
    q: search,
    page: page - 1,
  })
  const { data: counts } = useOrderCounts()
  const total = data?.page.totalElements ?? 0
  const open = (o: OrderListItem) => navigate(`/orders/${o.id}`)
  const withCount = (label: string, n: number | undefined) =>
    n == null ? label : `${label} (${n})`

  const goIntake = () => navigate('/intake')
  const handleRetry = () => refetch()
  const rowKey = (o: OrderListItem) => o.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string) => setStatus(v as typeof status)

  const primaryAction = { label: 'Tạo đơn', onClick: goIntake }

  const statusOptions = [
    { label: withCount('Tất cả', counts?.ALL), value: 'ALL' },
    ...ORDER_STATUSES.map((s) => ({
      label: withCount(ORDER_STATUS_LABEL[s], counts?.[s]),
      value: s,
    })),
  ]

  const filters = (
    <>
      <TextInput
        w={320}
        placeholder="Mã đơn / tên / SĐT"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
      />
      <SegmentedControl value={status} onChange={handleStatusChange} data={statusOptions} />
    </>
  )

  const columns: DataTableColumn<OrderListItem>[] = [
    {
      name: 'code',
      label: 'Mã đơn',
      width: 190,
      fixed: 'left',
      render: (o) => <CopyableCode code={o.orderCode} />,
    },
    {
      name: 'customer',
      label: 'Khách hàng',
      fixed: 'left',
      render: (o) => (
        <Stack gap={0}>
          <Text fw={500}>{o.customerName}</Text>
          <Text size="sm" c="dimmed">
            {formatPhone(o.customerPhone)}
          </Text>
        </Stack>
      ),
    },
    {
      name: 'receivedAt',
      label: 'Nhận lúc',
      width: 200,
      render: (o) => shortDateTime(o.receivedAt),
    },
    { name: 'dueAt', label: 'Hẹn trả', width: 200, render: (o) => shortDateTime(o.dueAt) },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 200,
      render: (o) => (
        <OrderStatusCell
          status={o.status}
          isOverdue={o.isOverdue}
          orderType={o.orderType}
          whites={o.washWhitesSeparately}
        />
      ),
    },
    {
      name: 'payment',
      label: 'Thanh toán',
      width: 150,
      render: (o) =>
        o.status === 'CANCELLED' ? (
          <Text c="dimmed">—</Text>
        ) : (
          <StatusBadge group="payment" statusKey={o.paymentStatus.toLowerCase()} size="sm" />
        ),
    },
    {
      name: 'total',
      label: 'Tổng',
      width: 120,
      align: 'right',
      render: (o) =>
        o.status === 'CANCELLED' ? (
          <Text c="dimmed">0đ</Text>
        ) : isUnclassified(o) ? (
          <Text c="dimmed">—</Text>
        ) : (
          <Money value={o.totalAmount} />
        ),
    },
    {
      name: 'open',
      label: '',
      width: 60,
      align: 'right',
      fixed: 'right',
      render: (o) => (
        <IconButton
          label="Mở chi tiết đơn"
          icon={<LuChevronRight size={18} />}
          onClick={() => open(o)}
        />
      ),
    },
  ]

  const rowProps = (o: OrderListItem) => ({
    onClick: () => open(o),
    style: { cursor: 'pointer', opacity: o.status === 'CANCELLED' ? 0.6 : undefined },
  })

  const empty = filtered ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không tìm thấy đơn"
      description={
        search.trim()
          ? `Không có đơn nào khớp "${search.trim()}".`
          : 'Không có đơn nào ở trạng thái này.'
      }
      action={
        <Button variant="secondary" onClick={reset}>
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
