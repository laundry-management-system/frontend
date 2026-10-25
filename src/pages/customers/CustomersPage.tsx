import { Button, SegmentedControl, Text, TextInput } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuSearch, LuSearchX, LuUserPlus, LuUsers } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import {
  type Customer,
  CUSTOMER_STATUS_LABEL,
  type CustomerStatus,
  CustomerCell,
  CustomerFormModal,
  CustomerStatusText,
  formatPhone,
  looksLikePhone,
  useCustomers,
} from '@/features/customers'
import { useListParams } from '@/shared/hooks/useListParams'
import { CopyableCode, type DataTableColumn, EmptyState, ListPage } from '@/shared/ui'

const STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly CustomerStatus[]

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: CUSTOMER_STATUS_LABEL.ACTIVE, value: 'ACTIVE' },
  { label: CUSTOMER_STATUS_LABEL.INACTIVE, value: 'INACTIVE' },
]

export default function CustomersPage() {
  const navigate = useNavigate()
  const { q, setQ, search, status, setStatus, page, setPage } = useListParams(STATUSES)
  const [modal, setModal] = useState<{ phone?: string; fullName?: string } | null>(null)

  const { data, isLoading, isError, refetch } = useCustomers({
    search,
    status: status === 'ALL' ? undefined : status,
    page: page - 1,
  })
  const total = data?.page.totalElements ?? 0
  const size = data?.page.size ?? 20
  const from = total ? (page - 1) * size + 1 : 0
  const to = Math.min(page * size, total)
  const stat = () => <Text c="dimmed">—</Text> // shortcut: chờ thống kê khách từ BE-1

  const openCreate = () => {
    const term = search.trim()
    setModal(!term ? {} : looksLikePhone(term) ? { phone: term } : { fullName: term })
  }

  const openDetail = (c: Customer) => navigate(`/customers/${c.id}`)
  const closeModal = () => setModal(null)
  const showAll = () => setStatus('ALL')
  const handleRetry = () => refetch()
  const rowKey = (c: Customer) => c.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string) => setStatus(v as CustomerStatus | 'ALL')

  const primaryAction = { label: 'Thêm khách', onClick: () => setModal({}) }

  const filters = (
    <>
      <TextInput
        w={360}
        placeholder="Số điện thoại hoặc họ tên"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
      />
      <SegmentedControl value={status} onChange={handleStatusChange} data={STATUS_OPTIONS} />
    </>
  )

  const columns: DataTableColumn<Customer>[] = [
    {
      name: 'code',
      label: 'Mã KH',
      width: 150,
      fixed: 'left',
      render: (c) => <CopyableCode code={c.code} />,
    },
    {
      name: 'fullName',
      label: 'Họ và tên',
      fixed: 'left',
      render: (c) => <CustomerCell customer={c} />,
    },
    {
      name: 'phone',
      label: 'Số điện thoại',
      width: 140,
      render: (c) => formatPhone(c.phone),
    },
    { name: 'orderCount', label: 'Số đơn', width: 100, align: 'center', render: stat },
    { name: 'totalSpent', label: 'Tổng chi tiêu', width: 140, align: 'center', render: stat },
    { name: 'lastOrderAt', label: 'Đơn gần nhất', width: 130, render: stat },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 140,
      render: (c) => <CustomerStatusText status={c.status} />,
    },
  ]

  const rowProps = (c: Customer) => ({
    onClick: () => openDetail(c),
    style: { cursor: 'pointer', opacity: c.status === 'INACTIVE' ? 0.6 : undefined },
  })

  const empty = search.trim() ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không tìm thấy khách"
      description={`Không có khách nào khớp "${search.trim()}".`}
      action={
        <Button leftSection={<LuUserPlus size={16} />} onClick={openCreate}>
          Thêm khách
        </Button>
      }
    />
  ) : status !== 'ALL' ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title={`Không có khách ${CUSTOMER_STATUS_LABEL[status].toLowerCase()}`}
      action={
        <Button variant="secondary" onClick={showAll}>
          Xem tất cả khách
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<LuUsers size={32} />}
      title="Chưa có khách hàng"
      description="Khách mới thêm sẽ hiện ở đây."
    />
  )

  return (
    <>
      <ListPage<Customer>
        title="Khách hàng"
        description={`${total.toLocaleString('vi-VN')} khách`}
        primaryAction={primaryAction}
        filters={filters}
        columns={columns}
        data={data?.content ?? []}
        rowKey={rowKey}
        loading={isLoading}
        error={isError}
        onRetry={handleRetry}
        rowProps={rowProps}
        empty={empty}
        page={page}
        totalPages={data?.page.totalPages}
        onPageChange={setPage}
      >
        {total > 0 && (
          <Text size="sm" c="dimmed" mt="xs">
            Hiển thị {from}–{to} / {total.toLocaleString('vi-VN')} khách
          </Text>
        )}
      </ListPage>

      <CustomerFormModal
        opened={!!modal}
        onClose={closeModal}
        mode="create"
        prefill={modal ?? undefined}
        onSaved={openDetail}
      />
    </>
  )
}
