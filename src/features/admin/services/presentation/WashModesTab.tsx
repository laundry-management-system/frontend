import { Badge, Button, Select, Stack, Text, TextInput } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuSearch, LuSearchX, LuWashingMachine } from 'react-icons/lu'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import {
  ConfirmModal,
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  ListPage,
  RowActions,
  FILTER_SELECT_PROPS,
} from '@/shared/admin/ui'
import { useSaveWashMode } from '../application/mutations/useSaveWashMode'
import { useActiveServices } from '../application/queries/useActiveServices'
import { useWashMode } from '../application/queries/useWashMode'
import { useWashModes } from '../application/queries/useWashModes'
import { priceFor } from '../domain/rules'
import type { WashMode } from '../domain/types'
import { WashModeFormModal } from './WashModeFormModal'

type ModalState = { modeId?: number } | null
type StatusTarget = { mode: WashMode; active: boolean } | null

const STATUSES = ['ACTIVE', 'INACTIVE'] as const

const rowKey = (m: WashMode) => m.id

export function WashModesTab() {
  const canManage = useAuthStore(selectHasRole('ADMIN'))
  const { data, isLoading, isError, refetch } = useWashModes()
  const { data: services } = useActiveServices()
  const { q, setQ, search, status, setStatus, filtered, reset } = useListParams(STATUSES)
  const [modal, setModal] = useState<ModalState>(null)
  const closeModal = () => setModal(null)
  const handleRetry = () => refetch()
  const openCreate = () => setModal({})
  const save = useSaveWashMode()
  const [statusTarget, setStatusTarget] = useState<StatusTarget>(null)
  const closeStatus = () => setStatusTarget(null)
  const { data: targetDetail } = useWashMode(statusTarget?.mode.id ?? null)

  const allModes = data ?? []
  const activeModeCount = allModes.filter((m) => m.active).length
  // Hình thức mặc định và hình thức hoạt động cuối cùng không ngừng được
  const canStop = (m: WashMode) => m.active && !m.isDefault && activeModeCount > 1
  const rowActions = (m: WashMode) => [
    { label: 'Sửa', onClick: () => setModal({ modeId: m.id }) },
    {
      label: 'Ngừng hoạt động',
      danger: true,
      hidden: !canStop(m),
      onClick: () => setStatusTarget({ mode: m, active: false }),
    },
    {
      label: 'Kích hoạt lại',
      hidden: m.active,
      onClick: () => setStatusTarget({ mode: m, active: true }),
    },
  ]

  // Ngừng: dịch vụ chỉ còn hình thức này đang hoạt động
  const otherActiveIds = new Set(
    allModes.filter((m) => m.active && m.id !== statusTarget?.mode.id).map((m) => m.id),
  )
  const onlyThis =
    statusTarget && !statusTarget.active && targetDetail
      ? (services ?? []).filter(
          (s) =>
            targetDetail.services.some((l) => l.serviceId === s.id) &&
            !s.prices.some((p) => otherActiveIds.has(p.washModeId)),
        )
      : []
  const confirmStatus = () => {
    if (!statusTarget || !targetDetail) return
    const { name, completionHours, isDefault, services: lines } = targetDetail
    save.mutate(
      {
        id: targetDetail.id,
        dto: { name, completionHours, isDefault, active: statusTarget.active, services: lines },
      },
      {
        onSuccess: () =>
          notify.success(
            statusTarget.active
              ? 'Đã kích hoạt lại hình thức giặt'
              : 'Đã ngừng hoạt động hình thức giặt',
          ),
        onError: (err) => notify.error(toApiError(err).message),
        onSettled: closeStatus,
      },
    )
  }
  const keyword = search.trim().toLowerCase()
  const modes = allModes.filter(
    (m) =>
      (status === 'ALL' || m.active === (status === 'ACTIVE')) &&
      (!keyword ||
        m.name.toLowerCase().includes(keyword) ||
        m.code.toLowerCase().includes(keyword)),
  )
  const activeCount = allModes.filter((m) => m.active).length
  const statusOptions = [
    { label: `Trạng thái: Tất cả (${allModes.length})`, value: 'ALL' },
    { label: `Trạng thái: Hoạt động (${activeCount})`, value: 'ACTIVE' },
    { label: `Trạng thái: Ngừng (${allModes.length - activeCount})`, value: 'INACTIVE' },
  ]
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string | null) => setStatus(v as (typeof STATUSES)[number] | 'ALL')
  const filters = (
    <>
      <TextInput
        w={320}
        placeholder="Tìm theo mã hoặc tên"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={260}
        allowDeselect={false}
        data={statusOptions}
        value={status}
        onChange={handleStatusChange}
      />
    </>
  )
  const linkCount = (m: WashMode) =>
    (services ?? []).filter((s) => priceFor(s, m.id) != null).length

  const primaryAction = canManage ? { label: 'Thêm hình thức', onClick: openCreate } : undefined

  const columns: DataTableColumn<WashMode>[] = [
    {
      name: 'code',
      label: 'Mã',
      width: 110,
      render: (m) => <CopyableCode code={m.code} />,
    },
    {
      name: 'name',
      label: 'Tên hình thức',
      width: 260,
      render: (m) => (
        <Text>
          {m.name}{' '}
          {m.isDefault && (
            <Badge ml={4} variant="light">
              Mặc định
            </Badge>
          )}
        </Text>
      ),
    },
    {
      name: 'completionHours',
      label: 'Thời gian hoàn thành',
      width: 180,
      render: (m) => `${m.completionHours} giờ`,
    },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 150,
      render: (m) => (
        <Badge color={m.active ? 'success' : 'neutral'} variant="light">
          {m.active ? 'Hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      ),
    },
    {
      name: 'services',
      label: 'Dịch vụ áp dụng',
      align: 'center',
      width: 150,
      render: (m) => (services ? linkCount(m) : '—'),
    },
    ...(canManage
      ? [
          {
            name: 'actions',
            label: '',
            width: 40,
            align: 'right' as const,
            fixed: 'right' as const,
            render: (m: WashMode) => <RowActions items={rowActions(m)} />,
          },
        ]
      : []),
  ]

  const empty =
    filtered && allModes.length ? (
      <EmptyState
        icon={<LuSearchX size={32} />}
        title="Không tìm thấy hình thức"
        description="Không có hình thức nào khớp bộ lọc."
        action={
          <Button variant="secondary" onClick={reset}>
            Xóa bộ lọc
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={<LuWashingMachine size={32} />}
        title="Chưa có hình thức giặt nào"
        description="Hình thức giặt sẽ hiện ở đây sau khi Admin thêm."
      />
    )

  return (
    <>
      <ListPage<WashMode>
        title="Hình thức giặt"
        description={`${modes.length} hình thức`}
        primaryAction={primaryAction}
        filters={filters}
        info="Mỗi hình thức có thời gian hoàn thành và giá riêng cho từng dịch vụ. Hình thức đã ngừng vẫn giữ giá đã liên kết."
        columns={columns}
        data={modes}
        rowKey={rowKey}
        loading={isLoading}
        error={isError}
        onRetry={handleRetry}
        empty={empty}
      />
      <ConfirmModal
        opened={!!statusTarget}
        onClose={closeStatus}
        onConfirm={confirmStatus}
        kind={statusTarget?.active ? 'confirm' : 'destructive'}
        title={
          statusTarget?.active ? 'Kích hoạt lại hình thức giặt' : 'Ngừng hoạt động hình thức giặt'
        }
        confirmLabel={statusTarget?.active ? 'Kích hoạt lại' : 'Ngừng hoạt động'}
        loading={save.isPending || !targetDetail}
      >
        <Stack gap="sm">
          <Text size="sm">
            {statusTarget?.active
              ? `Hình thức "${statusTarget.mode.name}" sẽ chọn được lại khi tạo đơn mới.`
              : onlyThis.length
                ? `${onlyThis.length} dịch vụ chỉ còn hình thức này, sẽ không tạo đơn được cho tới khi có hình thức khác:`
                : 'Hình thức sẽ không còn chọn được khi tạo đơn mới; đơn cũ giữ nguyên.'}
          </Text>
          {onlyThis.length > 0 && (
            <Text size="sm" c="dimmed" mah={160} style={{ overflowY: 'auto' }}>
              {onlyThis.map((s) => s.name).join(', ')}
            </Text>
          )}
        </Stack>
      </ConfirmModal>
      <WashModeFormModal opened={!!modal} onClose={closeModal} modeId={modal?.modeId} />
    </>
  )
}
