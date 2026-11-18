import { Button, TextInput } from '@mantine/core'
import dayjs from 'dayjs'
import { type ChangeEvent, useState } from 'react'
import { LuSearch, LuSearchX, LuTicketPercent } from 'react-icons/lu'
import {
  formatDiscount,
  formatValidity,
  useVouchers,
  type Voucher,
  voucherDisplayStatus,
  VoucherFormModal,
  VoucherStatusModal,
} from '@/features/admin/vouchers'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import { formatMoney } from '@/shared/common/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  ListPage,
  RowActions,
  StatusBadge,
} from '@/shared/admin/ui'

const NO_STATUSES = [] as const

type ModalState =
  | { kind: 'create' }
  | { kind: 'edit'; voucher: Voucher }
  | { kind: 'status'; voucher: Voucher }
  | null

export default function VouchersPage() {
  const { q, setQ, search, page, setPage } = useListParams(NO_STATUSES)
  const [modal, setModal] = useState<ModalState>(null)

  const { data, isLoading, isError, refetch } = useVouchers({ search, page: page - 1 })
  const total = data?.page.totalElements ?? 0
  const today = dayjs().format('YYYY-MM-DD')
  const statusTarget = modal?.kind === 'status' ? modal.voucher : null

  const openCreate = () => setModal({ kind: 'create' })
  const close = () => setModal(null)
  const clearSearch = () => setQ('')
  const handleRetry = () => refetch()
  const rowKey = (v: Voucher) => v.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)

  const primaryAction = { label: 'Tạo voucher', onClick: openCreate }

  const filters = (
    <TextInput
      w={320}
      placeholder="Tìm theo mã"
      leftSection={<LuSearch size={16} />}
      value={q}
      onChange={handleSearchChange}
    />
  )

  const rowActions = (v: Voucher) => [
    { label: 'Sửa', onClick: () => setModal({ kind: 'edit', voucher: v }) },
    {
      label: 'Tắt voucher',
      danger: true,
      hidden: v.status === 'DISABLED',
      onClick: () => setModal({ kind: 'status', voucher: v }),
    },
    {
      label: 'Bật voucher',
      hidden: v.status === 'ACTIVE',
      onClick: () => setModal({ kind: 'status', voucher: v }),
    },
  ]

  const columns: DataTableColumn<Voucher>[] = [
    {
      name: 'code',
      label: 'Mã',
      width: 140,
      fixed: 'left',
      render: (v) => <CopyableCode code={v.code} />,
    },
    { name: 'discount', label: 'Giảm', width: 110, render: formatDiscount },
    { name: 'validity', label: 'Hiệu lực', width: 190, render: formatValidity },
    {
      name: 'minOrderValue',
      label: 'Đơn tối thiểu',
      width: 130,
      render: (v) => formatMoney(v.minOrderValue),
    },
    {
      name: 'usedCount',
      label: 'Đã dùng',
      width: 100,
      align: 'center',
      render: (v) => `${v.usedCount} / ${v.maxUses}`,
    },
    {
      name: 'status',
      label: 'Trạng thái',
      render: (v) => <StatusBadge group="voucher" statusKey={voucherDisplayStatus(v, today)} />,
    },
    {
      name: 'actions',
      label: '',
      width: 40,
      align: 'right',
      fixed: 'right',
      render: (v) => <RowActions items={rowActions(v)} />,
    },
  ]

  const empty = search.trim() ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không tìm thấy voucher"
      description={`Không có mã nào chứa "${search.trim()}".`}
      action={
        <Button variant="secondary" onClick={clearSearch}>
          Xóa tìm kiếm
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<LuTicketPercent size={32} />}
      title="Chưa có voucher"
      description="Các mã giảm giá sẽ hiện ở đây."
      action={
        <Button leftSection={<LuTicketPercent size={16} />} onClick={openCreate}>
          Tạo voucher
        </Button>
      }
    />
  )

  return (
    <ListPage<Voucher>
      title="Voucher"
      description={`${total.toLocaleString('vi-VN')} mã`}
      info="Voucher đã tắt không áp được nữa nhưng vẫn giữ lại. Đơn đã áp trước đó giữ nguyên số tiền giảm."
      primaryAction={primaryAction}
      filters={filters}
      columns={columns}
      data={data?.content ?? []}
      rowKey={rowKey}
      loading={isLoading}
      error={isError}
      onRetry={handleRetry}
      empty={empty}
      page={page}
      totalPages={data?.page.totalPages}
      onPageChange={setPage}
    >
      <VoucherFormModal
        opened={modal?.kind === 'create' || modal?.kind === 'edit'}
        onClose={close}
        voucher={modal?.kind === 'edit' ? modal.voucher : null}
      />
      <VoucherStatusModal voucher={statusTarget} onClose={close} />
    </ListPage>
  )
}
