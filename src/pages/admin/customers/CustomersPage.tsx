import { Button, Select, Text, TextInput } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuSearch, LuSearchX, LuUserPlus, LuUsers } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import {
  type Customer,
  CUSTOMER_STATUS_LABEL,
  type CustomerStatus,
  CustomerFormModal,
  looksLikePhone,
  useActivateRegistration,
  useCustomers,
  useRejectRegistration,
} from '@/features/admin/customers'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import {
  ConfirmModal,
  type DataTableColumn,
  EmptyState,
  EntityCode,
  ListPage,
  RowActions,
  FILTER_SELECT_PROPS,
} from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'
import { notify } from '@/shared/common/lib/notify'
import { CUSTOMER_COLUMNS } from './components/customerColumns'
import { PendingAccountFilter } from './components/PendingAccountFilter'
import { usePendingAccountParam } from './components/usePendingAccountParam'

const STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly CustomerStatus[]

const STATUS_OPTIONS = [
  { label: `Trạng thái: Tất cả`, value: 'ALL' },
  { label: `Trạng thái: ${CUSTOMER_STATUS_LABEL.ACTIVE}`, value: 'ACTIVE' },
  { label: `Trạng thái: ${CUSTOMER_STATUS_LABEL.INACTIVE}`, value: 'INACTIVE' },
]

type ReviewState = { kind: 'activate' | 'reject'; target: Customer } | null

export default function CustomersPage() {
  const navigate = useNavigate()
  const { q, setQ, search, status, setStatus, page, setPage } = useListParams(STATUSES)
  const [modal, setModal] = useState<{ phone?: string; fullName?: string } | null>(null)
  const [review, setReview] = useState<ReviewState>(null)

  // Duyệt tài khoản chỉ Admin làm được
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const pendingParam = usePendingAccountParam().pendingOnly
  const pendingOnly = isAdmin && pendingParam
  const { data, isLoading, isError, refetch } = useCustomers({
    search,
    status: status === 'ALL' ? undefined : status,
    pendingAccount: pendingOnly,
    page: page - 1,
  })
  const activate = useActivateRegistration()
  const reject = useRejectRegistration()
  const total = data?.page.totalElements ?? 0
  const size = data?.page.size ?? 20
  const from = total ? (page - 1) * size + 1 : 0
  const to = Math.min(page * size, total)
  const target = review?.target

  const openCreate = () => {
    const term = search.trim()
    setModal(!term ? {} : looksLikePhone(term) ? { phone: term } : { fullName: term })
  }

  const openDetail = (c: Customer) => navigate(PATHS.customerDetail(c.id))
  const closeModal = () => setModal(null)
  const closeReview = () => setReview(null)
  const openActivate = (c: Customer) => setReview({ kind: 'activate', target: c })
  const openReject = (c: Customer) => setReview({ kind: 'reject', target: c })
  const showAll = () => setStatus('ALL')
  const handleRetry = () => refetch()
  const rowKey = (c: Customer) => c.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string | null) => setStatus(v as CustomerStatus | 'ALL')

  const handleReviewError = (e: Error) => notify.error(e.message)
  const confirmActivate = () => {
    if (!target?.pendingRegistrationId) return
    activate.mutate(target.pendingRegistrationId, {
      onSuccess: (res) => {
        notify.success(`Đã duyệt tài khoản cho hồ sơ ${res.customerCode}`)
        closeReview()
      },
      onError: handleReviewError,
    })
  }
  const confirmReject = () => {
    if (!target?.pendingRegistrationId) return
    reject.mutate(target.pendingRegistrationId, {
      onSuccess: () => {
        notify.success('Đã từ chối yêu cầu')
        closeReview()
      },
      onError: handleReviewError,
    })
  }

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
      <Select
        {...FILTER_SELECT_PROPS}
        w={240}
        value={status}
        onChange={handleStatusChange}
        data={STATUS_OPTIONS}
        allowDeselect={false}
      />
      {isAdmin && <PendingAccountFilter />}
    </>
  )

  const rowActions = (c: Customer) => [
    {
      label: 'Duyệt tài khoản',
      onClick: () => openActivate(c),
      hidden: !c.pendingRegistrationId || c.status === 'INACTIVE',
    },
    {
      label: 'Từ chối',
      onClick: () => openReject(c),
      hidden: !c.pendingRegistrationId,
      danger: true,
    },
  ]

  const actionColumns: DataTableColumn<Customer>[] = isAdmin
    ? [
        {
          name: 'actions',
          label: '',
          width: 40,
          align: 'right',
          fixed: 'right',
          render: (c) => <RowActions items={rowActions(c)} />,
        },
      ]
    : []

  const columns = [...CUSTOMER_COLUMNS, ...actionColumns]

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
  ) : pendingOnly ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không có tài khoản nào chờ duyệt"
      description="Khách tự đăng ký trên web sẽ hiện ở đây."
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

  const targetCode = target && <EntityCode code={target.code} />
  const dialogs = (
    <>
      <CustomerFormModal
        opened={!!modal}
        onClose={closeModal}
        mode="create"
        prefill={modal ?? undefined}
        onSaved={openDetail}
      />

      <ConfirmModal
        opened={review?.kind === 'activate'}
        onClose={closeReview}
        onConfirm={confirmActivate}
        kind="confirm"
        title="Duyệt tài khoản"
        confirmLabel="Duyệt"
        loading={activate.isPending}
      >
        Mở tài khoản đăng nhập cho hồ sơ {targetCode}. Hãy gọi xác nhận chủ số điện thoại trước khi
        duyệt.
      </ConfirmModal>

      <ConfirmModal
        opened={review?.kind === 'reject'}
        onClose={closeReview}
        onConfirm={confirmReject}
        kind="destructive"
        title="Từ chối yêu cầu"
        confirmLabel="Từ chối"
        loading={reject.isPending}
      >
        Từ chối yêu cầu đăng ký của {target?.fullName}? Nếu hồ sơ {targetCode} được tạo từ chính yêu
        cầu này và chưa có đơn, hồ sơ sẽ bị xoá.
      </ConfirmModal>
    </>
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

      {dialogs}
    </>
  )
}
