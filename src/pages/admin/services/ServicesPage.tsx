import { Button, Select, Stack, Text, TextInput, Tooltip } from '@mantine/core'
import { type ChangeEvent, useState } from 'react'
import { LuPlus, LuSearch, LuSearchX, LuTags } from 'react-icons/lu'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import {
  isBookable,
  priceFor,
  useWashModes,
  SERVICE_STATUS_LABEL,
  type Service,
  type ServiceStatus,
  PriceTimelineDrawer,
  ServiceFormModal,
  ServiceStatusBadge,
  toStatusChangeDto,
  useUpdateService,
  UNIT_LABEL,
  usePriceIssued,
  useServices,
} from '@/features/admin/services'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { formatDate, formatMoney, formatNumber } from '@/shared/common/lib/format'
import {
  type DataTableColumn,
  EmptyState,
  ConfirmModal,
  ListPage,
  RowActions,
  CopyableCode,
  FILTER_SELECT_PROPS,
} from '@/shared/admin/ui'

const MISSING_DEFAULT_HINT = 'Dịch vụ chưa có giá cho hình thức mặc định'

type ModalState = { mode: 'create' } | { mode: 'edit'; service: Service } | null

const STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly ServiceStatus[]

const STATUS_OPTIONS = [
  { label: 'Trạng thái: Tất cả', value: 'ALL' },
  ...STATUSES.map((st) => ({ label: `Trạng thái: ${SERVICE_STATUS_LABEL[st]}`, value: st })),
]

export default function ServicesPage() {
  const canManage = useAuthStore(selectHasRole('ADMIN'))
  const { q, setQ, search, status, setStatus, page, setPage, filtered, reset } =
    useListParams(STATUSES)
  const { data, isLoading, isError, refetch } = useServices({
    search,
    status: status === 'ALL' ? undefined : status,
    page: page - 1,
  })
  const { data: issued } = usePriceIssued()
  const [modal, setModal] = useState<ModalState>(null)
  const openCreate = () => setModal({ mode: 'create' })
  const closeModal = () => setModal(null)
  const [timelineFor, setTimelineFor] = useState<Service | null>(null)
  const closeTimeline = () => setTimelineFor(null)
  const handleRetry = () => refetch()
  const updateService = useUpdateService()
  const [stopTarget, setStopTarget] = useState<Service | null>(null)
  const closeStop = () => setStopTarget(null)
  const rowKey = (s: Service) => s.id
  const { data: modes } = useWashModes()
  const sortedModes = modes ?? []
  const defaultModeId = modes?.find((m) => m.isDefault)?.id
  // Chỉ cảnh báo khi đã tải xong hình thức, tránh nháy cảnh báo lúc đang tải
  const missingDefault = (s: Service) => !!modes && !isBookable(s, defaultModeId)
  const rowProps = (s: Service) => ({
    className: missingDefault(s) ? 'ds-row-warning' : undefined,
    style: { opacity: s.status === 'INACTIVE' ? 0.6 : undefined },
  })
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string | null) => setStatus(v as ServiceStatus | 'ALL')

  const changeStatus = (s: Service, next: ServiceStatus) => {
    const activeModes = sortedModes.filter((m) => m.active)
    updateService.mutate(
      { id: s.id, dto: toStatusChangeDto(s, activeModes, next) },
      {
        onSuccess: () =>
          notify.success(
            next === 'ACTIVE' ? 'Đã kích hoạt lại dịch vụ' : 'Đã ngừng hoạt động dịch vụ',
          ),
        onError: (err) => notify.error(toApiError(err).message),
        onSettled: closeStop,
      },
    )
  }
  const confirmStop = () => stopTarget && changeStatus(stopTarget, 'INACTIVE')

  const rowActions = (s: Service) => [
    { label: 'Sửa', onClick: () => setModal({ mode: 'edit', service: s }) },
    { label: 'Diễn biến đơn giá', onClick: () => setTimelineFor(s) },
    s.status === 'ACTIVE'
      ? { label: 'Ngừng hoạt động', danger: true, onClick: () => setStopTarget(s) }
      : { label: 'Kích hoạt lại', onClick: () => changeStatus(s, 'ACTIVE') },
  ]

  const columns: DataTableColumn<Service>[] = [
    {
      name: 'code',
      label: 'Mã',
      width: 120,
      fixed: 'left',
      render: (s) => <CopyableCode code={s.code} />,
    },
    {
      name: 'name',
      label: 'Tên dịch vụ',
      width: 250,
      fixed: 'left',
      render: (s) => (
        <Tooltip label={MISSING_DEFAULT_HINT} disabled={!missingDefault(s)}>
          <Text tabIndex={missingDefault(s) ? 0 : undefined}>{s.name}</Text>
        </Tooltip>
      ),
    },
    {
      name: 'unit',
      label: 'Đơn vị',
      width: 100,
      render: (s) => (s.unit ? UNIT_LABEL[s.unit] : '—'),
    },
    {
      name: 'prices',
      label: 'Giá theo hình thức',
      width: 260,
      render: (s) => (
        <Stack gap={4} style={{ whiteSpace: 'nowrap' }}>
          {sortedModes.map((m) => {
            const price = priceFor(s, m.id)
            return price == null ? null : (
              <Text key={m.id} size="sm" c={m.active ? undefined : 'dimmed'}>
                <Text span fw={600} inherit>
                  {m.name}:
                </Text>{' '}
                {formatMoney(price)}/{s.unit ? UNIT_LABEL[s.unit] : 'đơn vị'}
                {!m.active && ' (ngừng)'}
              </Text>
            )
          })}
        </Stack>
      ),
    },
    {
      name: 'minQuantity',
      label: 'Tối thiểu',
      align: 'center',
      width: 110,
      render: (s) =>
        s.minQuantity ? `${formatNumber(s.minQuantity)} ${s.unit ? UNIT_LABEL[s.unit] : ''}` : '—',
    },
    {
      name: 'whites',
      label: 'Đồ trắng',
      width: 100,
      render: (s) => (s.whitesApplicable ? 'Có' : 'Không'),
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
            fixed: 'right' as const,
            render: (s: Service) => <RowActions items={rowActions(s)} />,
          },
        ]
      : []),
  ]

  const primaryAction = canManage ? { label: 'Thêm dịch vụ', onClick: openCreate } : undefined
  const issuedText = issued?.effectiveFrom
    ? ` · Áp dụng từ ${formatDate(issued.effectiveFrom)} · ban hành bởi ${issued.issuedBy}`
    : ''

  const filters = (
    <>
      <TextInput
        w={320}
        placeholder="Mã hoặc tên dịch vụ"
        aria-label="Tìm theo mã hoặc tên dịch vụ"
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
    </>
  )

  const empty = filtered ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không tìm thấy dịch vụ"
      description={search.trim() ? `Không có dịch vụ nào khớp "${search.trim()}".` : undefined}
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

  return (
    <>
      <ListPage<Service>
        title="Bảng giá dịch vụ"
        description={`${data?.page.totalElements ?? 0} dịch vụ${issuedText}`}
        primaryAction={primaryAction}
        info="Đổi giá không ảnh hưởng đơn đã tạo – đơn giá được chốt trên từng dòng đơn."
        filters={filters}
        columns={columns}
        data={data?.content ?? []}
        page={page}
        totalPages={data?.page.totalPages}
        onPageChange={setPage}
        rowKey={rowKey}
        loading={isLoading}
        error={isError}
        onRetry={handleRetry}
        rowProps={rowProps}
        empty={empty}
      />

      <ServiceFormModal
        opened={!!modal}
        onClose={closeModal}
        mode={modal?.mode ?? 'create'}
        initial={modal?.mode === 'edit' ? modal.service : undefined}
      />
      <ConfirmModal
        opened={!!stopTarget}
        onClose={closeStop}
        onConfirm={confirmStop}
        kind="destructive"
        title="Ngừng hoạt động dịch vụ"
        confirmLabel="Ngừng hoạt động"
        loading={updateService.isPending}
      >
        {stopTarget &&
          `Dịch vụ "${stopTarget.name}" không còn trong lựa chọn khi phân loại đơn mới; đơn cũ giữ nguyên.`}
      </ConfirmModal>
      <PriceTimelineDrawer service={timelineFor} onClose={closeTimeline} />
    </>
  )
}
