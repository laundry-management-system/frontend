import { Button, Stack, Text, TextInput } from '@mantine/core'
import dayjs from 'dayjs'
import { type ChangeEvent, useState } from 'react'
import { LuPackageCheck, LuPrinter, LuSearch, LuSearchX } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { CustomerCell, formatPhone } from '@/features/customers'
import {
  filterStoredOrders,
  NotifyModal,
  STORED_ORDERS_LIMIT,
  type StoredOrder,
  StoredOrdersPrintSheet,
  useNow,
  useOverdueOrders,
} from '@/features/orders'
import { useListParams } from '@/shared/hooks/useListParams'
import { formatDate } from '@/shared/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  ListPage,
  RowActions,
  StatusBadge,
} from '@/shared/ui'

const NO_STATUSES = [] as const

const BASE_COLUMNS: DataTableColumn<StoredOrder>[] = [
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
        <CustomerCell customer={{ fullName: o.customerName, isVip: o.customerVip }} />
        <Text size="sm" c="dimmed">
          {formatPhone(o.customerPhone)}
        </Text>
      </Stack>
    ),
  },
  {
    name: 'completedAt',
    label: 'Hoàn thành',
    width: 120,
    render: (o) => formatDate(o.completedAt),
  },
  {
    name: 'days',
    label: 'Số ngày tồn',
    width: 120,
    align: 'center',
    render: (o) => <Text fw={700}>{o.daysInStorage}</Text>,
  },
  {
    name: 'notify',
    label: 'Số lần nhắc',
    width: 130,
    render: (o) =>
      o.notifyCount === 0 ? (
        <Text c="dimmed">Chưa nhắc</Text>
      ) : (
        <Stack gap={0}>
          <Text>{o.notifyCount} lần</Text>
          {o.lastNotifiedAt && (
            <Text size="xs" c="dimmed">
              Lần cuối {dayjs(o.lastNotifiedAt).format('DD/MM')}
            </Text>
          )}
        </Stack>
      ),
  },
  { name: 'shelf', label: 'Vị trí kệ', width: 90, render: (o) => o.shelfLocation ?? '—' },
  {
    name: 'payment',
    label: 'Thanh toán',
    width: 150,
    render: (o) => (
      <StatusBadge group="payment" statusKey={o.paymentStatus.toLowerCase()} size="sm" />
    ),
  },
]

export default function StoredOrdersPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useOverdueOrders()
  const [notifyFor, setNotifyFor] = useState<StoredOrder | null>(null)
  const { q, setQ, search, reset } = useListParams(NO_STATUSES)
  const now = useNow()
  const orders = data?.orders ?? []
  const rows = filterStoredOrders(orders, search)

  const countText =
    orders.length >= STORED_ORDERS_LIMIT ? `${STORED_ORDERS_LIMIT}+ đơn` : `${orders.length} đơn`
  const description = [
    `Ngày lập ${dayjs(now).format('DD/MM/YYYY')}`,
    ...(data ? [`số ngày quy định: ${data.overdueDays} ngày`, countText] : []),
  ].join(' · ')

  const openNotify = (o: StoredOrder) => setNotifyFor(o)
  const closeNotify = () => setNotifyFor(null)
  // Số lần nhắc mới về qua invalidate trong useComposeNotification
  const handleNotified = () => {}
  const handleRetry = () => refetch()
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const printList = () => window.print()
  const rowKey = (o: StoredOrder) => o.orderId
  const rowProps = (o: StoredOrder) => ({
    onClick: () => navigate(`/orders/${o.orderId}`),
    style: { cursor: 'pointer' },
  })

  const rowActions = (o: StoredOrder) => [{ label: 'Nhắn nhắc', onClick: () => openNotify(o) }]
  const columns: DataTableColumn<StoredOrder>[] = [
    ...BASE_COLUMNS,
    {
      name: 'actions',
      label: '',
      width: 40,
      align: 'right',
      fixed: 'right',
      render: (o) => <RowActions items={rowActions(o)} />,
    },
  ]

  const headerActions = (
    <Button
      variant="secondary"
      leftSection={<LuPrinter size={16} />}
      onClick={printList}
      disabled={rows.length === 0}
    >
      In danh sách
    </Button>
  )

  const filters = (
    <TextInput
      w={320}
      placeholder="Mã đơn / SĐT"
      leftSection={<LuSearch size={16} />}
      value={q}
      onChange={handleSearchChange}
    />
  )

  const empty =
    orders.length > 0 ? (
      <EmptyState
        icon={<LuSearchX size={32} />}
        title="Không tìm thấy đơn tồn phù hợp"
        description={`Không có đơn tồn nào khớp "${search.trim()}".`}
        action={
          <Button variant="secondary" onClick={reset}>
            Xóa tìm kiếm
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={<LuPackageCheck size={32} />}
        title="Không có đồ tồn"
        description="Đơn hoàn thành lâu mà khách chưa lấy sẽ hiện ở đây."
      />
    )

  return (
    <ListPage<StoredOrder>
      title="Đồ tồn chưa nhận"
      description={description}
      actions={headerActions}
      filters={filters}
      columns={columns}
      data={rows}
      rowKey={rowKey}
      rowProps={rowProps}
      loading={isLoading}
      error={isError}
      onRetry={handleRetry}
      empty={empty}
    >
      {notifyFor && (
        <NotifyModal order={notifyFor} onClose={closeNotify} onNotified={handleNotified} />
      )}
      {data && <StoredOrdersPrintSheet rows={rows} overdueDays={data.overdueDays} now={now} />}
    </ListPage>
  )
}
