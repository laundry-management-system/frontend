import { Button, Select, SimpleGrid, Skeleton } from '@mantine/core'
import { useState } from 'react'
import { LuCloudOff, LuPlus, LuWashingMachine, LuWind } from 'react-icons/lu'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import {
  brandOptions,
  countByStatus,
  countByType,
  type Machine,
  MachineCard,
  MachineDetailDrawer,
  MachineFormModal,
  MachineStatusAction,
  type MachineStatus,
  MachineStatusModal,
  type MachineType,
  MACHINE_TYPE_LABEL,
  type StatusChange,
  summaryText,
  useMachines,
} from '@/features/admin/machines'
import { EmptyState, PageHeader, RowActions, FILTER_SELECT_PROPS } from '@/shared/admin/ui'

type Tab = MachineType | 'ALL'
type FormModalState = { mode: 'create' } | { mode: 'edit'; machine: Machine } | null

const TABS: Tab[] = ['ALL', 'WASHER', 'DRYER']
const TAB_LABEL: Record<Tab, string> = { ALL: 'Tất cả', ...MACHINE_TYPE_LABEL }
const GRID_COLS = { base: 1, md: 3, xl: 4 }
const SKELETONS = [1, 2, 3, 4]
const PAGE_INFO =
  'Mọi lần đổi trạng thái máy được ghi nhật ký. Máy không bị xóa – chỉ Ngừng hoạt động (Admin).'

export default function MachinesPage() {
  const canManage = useAuthStore(selectHasRole('ADMIN'))
  const { data, isLoading, isError, refetch } = useMachines()
  const [tab, setTab] = useState<Tab>('ALL')
  const [formModal, setFormModal] = useState<FormModalState>(null)
  const [statusChange, setStatusChange] = useState<StatusChange | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)

  const machines = data ?? []
  const typeCounts = countByType(machines)
  const shown = tab === 'ALL' ? machines : machines.filter((m) => m.type === tab)
  // Lấy từ list để drawer luôn có dữ liệu mới sau khi refetch
  const detail = machines.find((m) => m.id === detailId) ?? null
  const brands = brandOptions(machines)

  const handleRetry = () => refetch()
  const handleTabChange = (v: string | null) => setTab(v as Tab)
  const openCreate = () => setFormModal({ mode: 'create' })
  const openEdit = (machine: Machine) => setFormModal({ mode: 'edit', machine })
  const closeForm = () => setFormModal(null)
  const openStatus = (machine: Machine, target: MachineStatus) =>
    setStatusChange({ machine, target })
  const closeStatus = () => setStatusChange(null)
  const openDetail = (id: number) => setDetailId(id)
  const closeDetail = () => setDetailId(null)
  const editFromDetail = () => {
    if (!detail) return
    setDetailId(null)
    openEdit(detail)
  }

  const tabOptions = TABS.map((t) => ({
    value: t,
    label: `Loại: ${TAB_LABEL[t]} (${typeCounts[t]})`,
  }))

  const addButton = canManage && (
    <Button leftSection={<LuPlus size={16} />} onClick={openCreate}>
      Thêm máy
    </Button>
  )

  const statusAction = (m: Machine) => (
    <MachineStatusAction machine={m} canManage={canManage} onChange={openStatus} />
  )

  const menuItems = (m: Machine) => [
    { label: 'Sửa', onClick: () => openEdit(m), hidden: m.status === 'RETIRED' },
    {
      label: 'Ngừng hoạt động',
      onClick: () => openStatus(m, 'RETIRED'),
      danger: true,
      hidden: m.status === 'RETIRED',
    },
  ]

  const cards = shown.map((m) => (
    <MachineCard
      key={m.id}
      machine={m}
      actions={statusAction(m)}
      menu={canManage && <RowActions items={menuItems(m)} />}
      onOpen={() => openDetail(m.id)}
    />
  ))

  const emptyTabIcon = tab === 'DRYER' ? <LuWind size={32} /> : <LuWashingMachine size={32} />

  const body = isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được danh sách máy"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={
        <Button variant="secondary" onClick={handleRetry}>
          Thử lại
        </Button>
      }
    />
  ) : isLoading ? (
    <SimpleGrid cols={GRID_COLS} spacing="lg" verticalSpacing="lg">
      {SKELETONS.map((i) => (
        <Skeleton key={i} h={260} radius="md" />
      ))}
    </SimpleGrid>
  ) : machines.length === 0 ? (
    <EmptyState
      icon={<LuWashingMachine size={32} />}
      title="Chưa có máy nào"
      description="Máy giặt và máy sấy của tiệm sẽ hiện ở đây."
      action={addButton}
    />
  ) : shown.length === 0 ? (
    <EmptyState
      icon={emptyTabIcon}
      title={`Chưa có ${TAB_LABEL[tab].toLowerCase()}`}
      description={`${TAB_LABEL[tab]} của tiệm sẽ hiện ở đây.`}
    />
  ) : (
    <SimpleGrid cols={GRID_COLS} spacing="lg" verticalSpacing="lg">
      {cards}
    </SimpleGrid>
  )

  return (
    <>
      <PageHeader
        title="Máy giặt & máy sấy"
        description={data && summaryText(countByStatus(machines))}
        info={PAGE_INFO}
        actions={addButton}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        mb="lg"
        w={200}
        value={tab}
        onChange={handleTabChange}
        data={tabOptions}
        allowDeselect={false}
      />
      {body}

      <MachineFormModal
        opened={!!formModal}
        onClose={closeForm}
        mode={formModal?.mode ?? 'create'}
        initial={formModal?.mode === 'edit' ? formModal.machine : undefined}
        brandOptions={brands}
      />
      <MachineDetailDrawer
        machine={detail}
        onClose={closeDetail}
        actions={detail && statusAction(detail)}
        onEdit={canManage && detail?.status !== 'RETIRED' ? editFromDetail : undefined}
      />
      <MachineStatusModal change={statusChange} onClose={closeStatus} />
    </>
  )
}
