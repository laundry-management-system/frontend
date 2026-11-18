import { Badge, Button, Card, Group, Skeleton, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'
import { LuCloudOff, LuMapPin, LuPlus } from 'react-icons/lu'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import {
  ConfirmModal,
  type DataTableColumn,
  DataTable,
  EmptyState,
  InfoLabel,
  Money,
  RowActions,
} from '@/shared/ui'
import { useChangeServiceAreaStatus } from '../application/useChangeServiceAreaStatus'
import { useServiceAreas } from '../application/useServiceAreas'
import type { ServiceArea } from '../domain/types'
import { ServiceAreaFormModal } from './ServiceAreaFormModal'

type ModalState = { mode: 'form'; area?: ServiceArea } | { mode: 'stop'; area: ServiceArea } | null

const LONG_TEXT = { overflowWrap: 'anywhere' } as const

export function ServiceAreasCard() {
  const { data, isLoading, isError, refetch } = useServiceAreas()
  const changeStatus = useChangeServiceAreaStatus()
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
    { label: 'Ngừng', danger: true, hidden: !a.active, onClick: () => openStop(a) },
    { label: 'Phục vụ lại', hidden: a.active, onClick: () => resume(a) },
  ]

  const columns: DataTableColumn<ServiceArea>[] = [
    { name: 'index', label: 'STT', width: 60, align: 'center', render: (_, i) => i + 1 },
    {
      name: 'name',
      label: 'Khu vực',
      render: (a) => (
        <Text fw={600} style={LONG_TEXT}>
          {a.name}
        </Text>
      ),
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

  const empty = (
    <EmptyState
      icon={<LuMapPin size={32} />}
      title="Chưa có khu vực giao nhận"
      description="Khu vực và phí lấy, giao tận nơi sẽ hiện ở đây."
      action={
        <Button leftSection={<LuPlus size={16} />} onClick={openCreate}>
          Thêm khu vực
        </Button>
      }
    />
  )

  const loadError = (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được khu vực giao nhận"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={handleRetry}>Thử lại</Button>}
    />
  )

  const loading = (
    <Stack gap="sm">
      <Skeleton h={36} />
      <Skeleton h={36} />
      <Skeleton h={36} />
    </Stack>
  )

  const table = (
    <DataTable<ServiceArea> columns={columns} data={data ?? []} rowKey={rowKey} empty={empty} />
  )

  const body = isLoading ? loading : isError && !data ? loadError : table
  const stopping = modal?.mode === 'stop' ? modal.area : undefined

  return (
    <Card mt="lg">
      <Stack>
        <Group justify="space-between" wrap="nowrap">
          <Title order={5}>
            <InfoLabel info="Khu vực đã dùng không bị xoá, chỉ ngừng phục vụ.">
              Khu vực và phí giao nhận
            </InfoLabel>
          </Title>
          <Button leftSection={<LuPlus size={16} />} onClick={openCreate} disabled={isLoading}>
            Thêm khu vực
          </Button>
        </Group>
        {body}
      </Stack>

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
        confirmLabel="Ngừng"
        loading={changeStatus.isPending}
      >
        Khu vực sẽ không còn hiện trên trang giới thiệu. Có thể phục vụ lại bất cứ lúc nào.
      </ConfirmModal>
    </Card>
  )
}
