import { Badge, Button, Select, Text, TextInput } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuMapPin, LuSearch, LuSearchX } from 'react-icons/lu'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import {
  ConfirmModal,
  type DataTableColumn,
  EmptyState,
  FILTER_SELECT_PROPS,
  ListPage,
  Money,
  RowActions,
} from '@/shared/admin/ui'
import { useChangeServiceAreaStatus } from '../application/useChangeServiceAreaStatus'
import { useServiceAreas } from '../application/useServiceAreas'
import type { ServiceArea } from '../domain/types'
import { ServiceAreaFormModal } from './ServiceAreaFormModal'

type ModalState = { mode: 'form'; area?: ServiceArea } | { mode: 'stop'; area: ServiceArea } | null

const STATUSES = ['ACTIVE', 'INACTIVE'] as const

const LONG_TEXT = { overflowWrap: 'anywhere' } as const

export function ServiceAreasTab() {
  const { data, isLoading, isError, refetch } = useServiceAreas()
  const changeStatus = useChangeServiceAreaStatus()
  const { q, setQ, search, status, setStatus, filtered, reset } = useListParams(STATUSES)
  const [modal, setModal] = useState<ModalState>(null)

  const handleRetry = () => refetch()
  const openCreate = () => setModal({ mode: 'form' })
  const openEdit = (area: ServiceArea) => setModal({ mode: 'form', area })
  const openStop = (area: ServiceArea) => setModal({ mode: 'stop', area })
  const closeModal = () => setModal(null)
  const closeStop = () => !changeStatus.isPending && closeModal()

  const setActive = (area: ServiceArea, active: boolean) =>
    changeStatus.mutate(
      { id: area.id, active },
      {
        onSuccess: () => {
          notify.success(`${active ? 'Đã phục vụ lại' : 'Đã ngừng phục vụ'} ${area.name}`)
          closeModal()
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    )
  const resume = (area: ServiceArea) => setActive(area, true)
  const confirmStop = () => modal?.mode === 'stop' && setActive(modal.area, false)

  const rowKey = (a: ServiceArea) => a.id
  const rowActions = (a: ServiceArea) => [
    { label: 'Sửa', onClick: () => openEdit(a) },
    { label: 'Ngừng hoạt động', danger: true, hidden: !a.active, onClick: () => openStop(a) },
    { label: 'Kích hoạt lại', hidden: a.active, onClick: () => resume(a) },
  ]

  const columns: DataTableColumn<ServiceArea>[] = [
    { name: 'index', label: 'STT', width: 60, align: 'center', render: (_, i) => i + 1 },
    {
      name: 'name',
      label: 'Khu vực',
      render: (a) => <Text style={LONG_TEXT}>{a.name}</Text>,
    },
    {
      name: 'pickupFee',
      label: 'Phí lượt lấy',
      width: 130,
      align: 'right',
      render: (a) => <Money value={a.pickupFee} />,
    },
    {
      name: 'deliveryFee',
      label: 'Phí lượt giao',
      width: 130,
      align: 'right',
      render: (a) => <Money value={a.deliveryFee} />,
    },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 150,
      render: (a) => (
        <Badge color={a.active ? 'success' : 'neutral'} variant="light">
          {a.active ? 'Đang phục vụ' : 'Ngừng phục vụ'}
        </Badge>
      ),
    },
    {
      name: 'actions',
      label: '',
      width: 40,
      align: 'right',
      fixed: 'right',
      render: (a) => <RowActions items={rowActions(a)} />,
    },
  ]

  const allAreas = data ?? []
  const activeCount = allAreas.filter((a) => a.active).length
  const keyword = search.trim().toLowerCase()
  const areas = allAreas.filter(
    (a) =>
      (status === 'ALL' || a.active === (status === 'ACTIVE')) &&
      (!keyword || a.name.toLowerCase().includes(keyword)),
  )
  const statusOptions = [
    { label: `Trạng thái: Tất cả (${allAreas.length})`, value: 'ALL' },
    { label: `Trạng thái: Đang phục vụ (${activeCount})`, value: 'ACTIVE' },
    { label: `Trạng thái: Ngừng phục vụ (${allAreas.length - activeCount})`, value: 'INACTIVE' },
  ]
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string | null) => setStatus(v as (typeof STATUSES)[number] | 'ALL')

  const primaryAction = { label: 'Thêm khu vực', onClick: openCreate }
  const filters = (
    <>
      <TextInput
        w={320}
        placeholder="Tìm theo tên khu vực"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={280}
        allowDeselect={false}
        data={statusOptions}
        value={status}
        onChange={handleStatusChange}
      />
    </>
  )

  const empty =
    filtered && allAreas.length ? (
      <EmptyState
        icon={<LuSearchX size={32} />}
        title="Không tìm thấy khu vực"
        description="Không có khu vực nào khớp bộ lọc."
        action={
          <Button variant="secondary" onClick={reset}>
            Xóa bộ lọc
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={<LuMapPin size={32} />}
        title="Chưa có khu vực giao nhận"
        description="Khu vực và phí lấy, giao tận nơi sẽ hiện ở đây."
        action={<Button onClick={openCreate}>Thêm khu vực</Button>}
      />
    )

  const stopping = modal?.mode === 'stop' ? modal.area : undefined

  return (
    <>
      <ListPage<ServiceArea>
        title="Khu vực giao nhận"
        description={`${areas.length} khu vực`}
        info="Khu vực đã dùng không bị xoá, chỉ ngừng phục vụ."
        primaryAction={primaryAction}
        filters={filters}
        columns={columns}
        data={areas}
        rowKey={rowKey}
        loading={isLoading}
        error={isError && !data}
        onRetry={handleRetry}
        empty={empty}
      />
      <ServiceAreaFormModal
        opened={modal?.mode === 'form'}
        onClose={closeModal}
        area={modal?.mode === 'form' ? modal.area : undefined}
      />
      <ConfirmModal
        opened={!!stopping}
        onClose={closeStop}
        onConfirm={confirmStop}
        kind="destructive"
        title={`Ngừng phục vụ ${stopping?.name ?? ''}?`}
        confirmLabel="Ngừng hoạt động"
        loading={changeStatus.isPending}
      >
        Khu vực sẽ không còn hiện trên trang giới thiệu. Có thể phục vụ lại bất cứ lúc nào.
      </ConfirmModal>
    </>
  )
}
