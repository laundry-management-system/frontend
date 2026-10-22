import { Button, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { LuPlus, LuSearch, LuSearchX, LuTags } from 'react-icons/lu'
import { selectHasRole, useAuthStore } from '@/features/auth'
import {
  expressParts,
  SERVICE_STATUS_LABEL,
  type Service,
  type ServiceStatus,
  ServiceFormModal,
  ServiceStatusBadge,
  UNIT_LABEL,
  useServices,
} from '@/features/services'
import { useListParams } from '@/shared/hooks/useListParams'
import {
  type DataTableColumn,
  EmptyState,
  EntityCode,
  ListPage,
  Money,
  RowActions,
} from '@/shared/ui'

type ModalState = { mode: 'create' } | { mode: 'edit'; service: Service } | null

const STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly ServiceStatus[]

export default function ServicesPage() {
  const canManage = useAuthStore(selectHasRole('ADMIN'))
  const { q, setQ, search, status, setStatus, page, setPage, filtered, reset } =
    useListParams(STATUSES)
  const { data, isLoading, isError, refetch } = useServices({
    search,
    status: status === 'ALL' ? undefined : status,
    page: page - 1,
  })
  const [modal, setModal] = useState<ModalState>(null)
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
      width: 140,
      render: (s) => `${s.standardHours} giờ`,
    },
    {
      name: 'express',
      label: 'Giặt nhanh',
      width: 200,
      render: (s) => {
        const e = expressParts(s)
        if (!e) return 'Không'
        return (
          <Stack gap={0} style={{ whiteSpace: 'nowrap' }}>
            <span>
              <b>Phụ phí:</b> {e.surcharge}
            </span>
            <span>
              <b>Thời gian:</b> {e.hours}
            </span>
          </Stack>
        )
      },
    },
    {
      name: 'status',
      label: 'Trạng thái',
      width: 150,
      render: (s) => <ServiceStatusBadge status={s.status} />,
    },
    ...(canManage
      ? [
          {
            name: 'actions',
            label: '',
            width: 40,
            align: 'right' as const,
            render: (s: Service) => (
              <RowActions
                items={[{ label: 'Sửa', onClick: () => setModal({ mode: 'edit', service: s }) }]}
              />
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <ListPage<Service>
        title="Bảng giá dịch vụ"
        description={`${data?.page.totalElements ?? 0} dịch vụ`}
        primaryAction={canManage ? { label: 'Thêm dịch vụ', onClick: openCreate } : undefined}
        info="Đổi giá không ảnh hưởng đơn đã tạo – đơn giá được chốt trên từng dòng đơn."
        filters={
          <>
            <TextInput
              w={320}
              placeholder="Mã hoặc tên dịch vụ"
              aria-label="Tìm theo mã hoặc tên dịch vụ"
              leftSection={<LuSearch size={16} />}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
            <SegmentedControl
              value={status}
              onChange={(v) => setStatus(v as ServiceStatus | 'ALL')}
              data={[
                { label: 'Tất cả', value: 'ALL' },
                ...STATUSES.map((st) => ({ label: SERVICE_STATUS_LABEL[st], value: st })),
              ]}
            />
          </>
        }
        columns={columns}
        data={data?.content ?? []}
        page={page}
        totalPages={data?.page.totalPages}
        onPageChange={setPage}
        rowKey={(s) => s.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        rowProps={(s) => ({ style: { opacity: s.status === 'INACTIVE' ? 0.6 : undefined } })}
        empty={
          filtered ? (
            <EmptyState
              icon={<LuSearchX size={32} />}
              title="Không tìm thấy dịch vụ"
              description={
                search.trim() ? `Không có dịch vụ nào khớp "${search.trim()}".` : undefined
              }
              action={
                <Button variant="secondary" onClick={reset}>
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
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
          )
        }
      />

      <ServiceFormModal
        opened={!!modal}
        onClose={() => setModal(null)}
        mode={modal?.mode ?? 'create'}
        initial={modal?.mode === 'edit' ? modal.service : undefined}
      />
    </>
  )
}
