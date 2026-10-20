import { Alert, Button, Text } from '@mantine/core'
import { useState } from 'react'
import { LuInfo, LuPencil, LuPlus, LuTags } from 'react-icons/lu'
import { selectHasRole, useAuthStore } from '@/features/auth'
import {
  expressLabel,
  type Service,
  ServiceFormModal,
  ServiceStatusBadge,
  UNIT_LABEL,
  useServices,
} from '@/features/services'
import { type DataTableColumn, EmptyState, EntityCode, ListPage, Money } from '@/shared/ui'

type ModalState = { mode: 'create' } | { mode: 'edit'; service: Service } | null

export default function ServicesPage() {
  const canManage = useAuthStore(selectHasRole('ADMIN'))
  const { data = [], isLoading, isError, refetch } = useServices()
  const [modal, setModal] = useState<ModalState>(null)
  const activeCount = data.filter((s) => s.status === 'ACTIVE').length
  const openCreate = () => setModal({ mode: 'create' })

  const columns: DataTableColumn<Service>[] = [
    { name: 'code', label: 'Mã', width: 80, render: (s) => <EntityCode code={s.code} /> },
    { name: 'name', label: 'Tên dịch vụ', render: (s) => <Text fw={600}>{s.name}</Text> },
    {
      name: 'unit',
      label: 'Đơn vị',
      width: 100,
      render: (s) => (s.unit ? UNIT_LABEL[s.unit] : '—'),
    },
    {
      name: 'price',
      label: 'Đơn giá',
      width: 120,
      align: 'right',
      render: (s) => <Money value={s.price} />,
    },
    {
      name: 'standardHours',
      label: 'Xử lý chuẩn',
      width: 110,
      render: (s) => `${s.standardHours} giờ`,
    },
    { name: 'express', label: 'Giặt nhanh', width: 200, render: (s) => expressLabel(s) },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 150,
      render: (s) => <ServiceStatusBadge status={s.status} />,
    },
    ...(canManage
      ? [
          {
            name: 'edit',
            label: '',
            width: 80,
            align: 'right' as const,
            render: (s: Service) => (
              <Button
                variant="subtle"
                size="xs"
                leftSection={<LuPencil size={14} />}
                onClick={() => setModal({ mode: 'edit', service: s })}
              >
                Sửa
              </Button>
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <ListPage<Service>
        title="Bảng giá dịch vụ"
        description={`${data.length} dịch vụ · ${activeCount} đang hoạt động`}
        primaryAction={canManage ? { label: 'Thêm dịch vụ', onClick: openCreate } : undefined}
        filters={
          <Alert color="info" icon={<LuInfo size={18} />} w="100%" p="xs">
            Đổi giá không ảnh hưởng đơn đã tạo – đơn giá được chốt trên từng dòng đơn.
          </Alert>
        }
        columns={columns}
        data={data}
        rowKey={(s) => s.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        rowProps={(s) => ({ style: { opacity: s.status === 'INACTIVE' ? 0.6 : undefined } })}
        empty={
          <EmptyState
            icon={<LuTags size={32} />}
            title="Chưa có dịch vụ nào"
            description="Dịch vụ sẽ hiện ở đây sau khi Admin thêm."
            action={
              canManage && (
                <Button leftSection={<LuPlus size={16} />} onClick={openCreate}>
                  Thêm dịch vụ
                </Button>
              )
            }
          />
        }
      >
        <Text size="xs" c="dimmed" mt="xs">
          {canManage
            ? 'Dịch vụ đã dùng trong đơn không xóa được – chỉ Ngừng hoạt động.'
            : 'Bảng giá chỉ xem.'}
        </Text>
      </ListPage>

      <ServiceFormModal
        opened={!!modal}
        onClose={() => setModal(null)}
        mode={modal?.mode ?? 'create'}
        initial={modal?.mode === 'edit' ? modal.service : undefined}
      />
    </>
  )
}
