import { Anchor, Badge, Button, Card, Select, Stack, Text, TextInput } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import dayjs from 'dayjs'
import type { ChangeEvent } from 'react'
import { LuCalendar, LuSearch, LuSearchX, LuTriangleAlert } from 'react-icons/lu'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  INCIDENT_TYPE_LABEL,
  type IncidentSummary,
  type IncidentType,
  payoutState,
  RESOLUTION_LABEL,
  useIncidents,
  useIncidentStats,
} from '@/features/admin/incidents'
import { DEFAULT_PAGE_SIZE } from '@/shared/admin/config/constants'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import { formatMoney, formatPhone } from '@/shared/common/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  ListPage,
  Money,
  StatusBadge,
  FILTER_SELECT_PROPS,
} from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

// Không có `status` trên URL = tab Chờ duyệt (mặc định); `all` = Tất cả
const TABS = ['approved', 'rejected', 'all'] as const
type Tab = (typeof TABS)[number] | 'ALL'
const DATE = 'YYYY-MM-DD'
const TYPE_OPTIONS = Object.entries(INCIDENT_TYPE_LABEL).map(([value, label]) => ({
  value,
  label: `Loại: ${label}`,
}))
const statusOfTab = (tab: Tab) => (tab === 'ALL' ? 'pending' : tab === 'all' ? undefined : tab)
const withCount = (label: string, n: number | undefined) => (n == null ? label : `${label} (${n})`)

export default function IncidentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { q, setQ, search, status, setStatus, page, setPage, reset } = useListParams(TABS)
  const type = (searchParams.get('type') as IncidentType | null) ?? undefined
  const createdFrom = searchParams.get('from') ?? undefined
  const createdTo = searchParams.get('to') ?? undefined
  const filterParams = { q: search.trim(), type, createdFrom, createdTo }

  const { data, isLoading, isError, refetch } = useIncidents({
    ...filterParams,
    status: statusOfTab(status),
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  })
  const { data: stats } = useIncidentStats(filterParams)
  const filtered = !!(search.trim() || type || createdFrom)

  const writeParam = (entries: Record<string, string | null>) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(entries)) {
          if (v) next.set(k, v)
          else next.delete(k)
        }
        next.delete('page')
        return next
      },
      { replace: true },
    )

  const goCreate = () => navigate(PATHS.incidentNew)
  const open = (i: IncidentSummary) => navigate(PATHS.incidentDetail(i.id))
  const handleRetry = () => refetch()
  const rowKey = (i: IncidentSummary) => i.id
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setQ(e.currentTarget.value)
  const handleStatusChange = (v: string | null) => setStatus(v as Tab)
  const handleTypeChange = (v: string | null) => writeParam({ type: v })
  // Chọn đủ hai đầu mới áp dụng; xóa thì bỏ lọc ngày
  const handleRangeChange = ([start, end]: DatesRangeValue) => {
    if (!start && !end) return writeParam({ from: null, to: null })
    if (!start || !end) return
    writeParam({ from: dayjs(start).format(DATE), to: dayjs(end).format(DATE) })
  }
  const clearFilters = () => {
    reset()
    writeParam({ type: null, from: null, to: null })
  }

  const primaryAction = { label: 'Lập phiếu sự cố', onClick: goCreate }

  const tabOptions = [
    { value: 'ALL', label: `Trạng thái: ${withCount('Chờ duyệt', stats?.pending)}` },
    { value: 'approved', label: `Trạng thái: ${withCount('Đã duyệt', stats?.approved)}` },
    { value: 'rejected', label: `Trạng thái: ${withCount('Từ chối', stats?.rejected)}` },
    { value: 'all', label: `Trạng thái: ${withCount('Tất cả', stats?.all)}` },
  ]
  const rangeValue: [Date | null, Date | null] = [
    createdFrom ? dayjs(createdFrom).toDate() : null,
    createdTo ? dayjs(createdTo).toDate() : null,
  ]
  const filters = (
    <>
      <Select
        {...FILTER_SELECT_PROPS}
        w={260}
        value={status}
        onChange={handleStatusChange}
        data={tabOptions}
        allowDeselect={false}
      />

      <TextInput
        w={320}
        placeholder="Mã sự cố / mã đơn / SĐT"
        leftSection={<LuSearch size={16} />}
        value={q}
        onChange={handleSearchChange}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={180}
        placeholder="Loại: Tất cả"
        data={TYPE_OPTIONS}
        clearable
        value={type ?? null}
        onChange={handleTypeChange}
      />
      <DatePickerInput
        type="range"
        w={280}
        placeholder="Ngày lập"
        valueFormat="DD/MM/YYYY"
        leftSection={<LuCalendar size={16} />}
        maxDate={new Date()}
        allowSingleDateInRange
        clearable
        value={rangeValue}
        onChange={handleRangeChange}
      />
    </>
  )

  const summary = (
    <Card mb="md" py="sm">
      <Anchor component={Link} to={PATHS.reportOperations} size="sm">
        Xem báo cáo vận hành
      </Anchor>
    </Card>
  )

  const statusCell = (i: IncidentSummary) => {
    const payout = payoutState(i)
    return (
      <Stack gap={4} align="flex-start">
        <StatusBadge group="incident" statusKey={i.status} size="sm" />
        {payout === 'due' && (
          <Badge color="warning" variant="light" size="sm">
            Cần chi {formatMoney(i.payoutDue)}
          </Badge>
        )}
        {payout === 'paid' && (
          <Text size="xs" c="dimmed">
            Đã chi {formatMoney(i.payoutDue)}
          </Text>
        )}
      </Stack>
    )
  }

  const columns: DataTableColumn<IncidentSummary>[] = [
    {
      name: 'code',
      label: 'Mã',
      width: 110,
      fixed: 'left',
      render: (i) => <CopyableCode code={i.code} />,
    },
    { name: 'order', label: 'Đơn', width: 220, render: (i) => <CopyableCode code={i.orderCode} /> },
    {
      name: 'customer',
      label: 'Khách hàng',
      width: 220,
      render: (i) => (
        <Stack gap={0}>
          <Text fw={500}>{i.customerName}</Text>
          <Text size="sm" c="dimmed">
            {formatPhone(i.customerPhone)}
          </Text>
        </Stack>
      ),
    },
    { name: 'type', label: 'Loại', width: 100, render: (i) => INCIDENT_TYPE_LABEL[i.type] },
    {
      name: 'resolution',
      label: 'Phương án',
      width: 120,
      render: (i) => (i.resolution ? RESOLUTION_LABEL[i.resolution] : <Text c="dimmed">—</Text>),
    },
    { name: 'amount', label: 'Số tiền', width: 120, render: (i) => <Money value={i.amount} /> },
    { name: 'createdBy', label: 'Người lập', width: 110, render: (i) => i.createdBy },
    { name: 'status', label: 'Trạng thái', width: 170, render: statusCell },
  ]

  const rowProps = (i: IncidentSummary) => ({
    onClick: () => open(i),
    style: { cursor: 'pointer' },
  })

  const noneAtAll = !filtered && stats?.all === 0
  const empty = !noneAtAll ? (
    <EmptyState
      icon={<LuSearchX size={32} />}
      title="Không có phiếu phù hợp"
      description={
        search.trim()
          ? `Không có phiếu nào khớp "${search.trim()}".`
          : 'Không có phiếu nào ở bộ lọc này.'
      }
      action={
        filtered ? (
          <Button variant="secondary" onClick={clearFilters}>
            Xóa lọc
          </Button>
        ) : undefined
      }
    />
  ) : (
    <EmptyState
      icon={<LuTriangleAlert size={32} />}
      title="Chưa có phiếu sự cố"
      description="Phiếu sự cố hư hỏng, thất lạc sẽ hiện ở đây."
      action={<Button onClick={goCreate}>Lập phiếu sự cố</Button>}
    />
  )

  return (
    <ListPage<IncidentSummary>
      title="Sự cố & bồi thường"
      description={`${(stats?.pending ?? 0).toLocaleString('vi-VN')} phiếu chờ duyệt`}
      info="Phiếu do nhân viên lập, Admin duyệt trước khi giảm giá hoặc bồi thường. Phiếu không tự đổi trạng thái đơn."
      primaryAction={primaryAction}
      filters={filters}
      summary={summary}
      columns={columns}
      data={data?.content ?? []}
      rowKey={rowKey}
      loading={isLoading}
      error={isError}
      onRetry={handleRetry}
      rowProps={rowProps}
      page={page}
      totalPages={data?.page.totalPages ?? 0}
      onPageChange={setPage}
      empty={empty}
    />
  )
}
