import { Anchor, Group, Select, SimpleGrid, Stack, Text } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import dayjs from 'dayjs'
import { LuCalendar, LuSearchX, LuWalletCards } from 'react-icons/lu'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  diffColor,
  differenceLabel,
  SHIFT_STATUS_LABEL,
  type ShiftRow,
  type ShiftStatus,
  ShiftStatusBadge,
  useShifts,
  useShiftSummary,
} from '@/features/admin/shifts'
import { useListParams } from '@/shared/admin/hooks/useListParams'
import { DEFAULT_PAGE_SIZE } from '@/shared/admin/config/constants'
import { formatMoney } from '@/shared/common/lib/format'
import {
  CopyableCode,
  type DataTableColumn,
  EmptyState,
  ListPage,
  StatTile,
  FILTER_SELECT_PROPS,
} from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

const STATUSES = ['OPEN', 'CLOSED', 'APPROVED'] as const satisfies readonly ShiftStatus[]
const STATUS_OPTIONS = [
  { label: 'Trạng thái: Tất cả', value: 'ALL' },
  ...STATUSES.map((s) => ({ label: `Trạng thái: ${SHIFT_STATUS_LABEL[s]}`, value: s })),
]
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const DATE = 'YYYY-MM-DD'
const PAGE_INFO =
  'Ca có chênh lệch tiền mặt hoặc chuyển khoản được tô màu. Mở ca để xem phiếu kết ca, giao dịch và duyệt ca.'

const money = (v: number | null) => (v === null ? '' : formatMoney(v))
const time = (iso: string) => dayjs(iso).format('DD/MM HH:mm')

/** Một ô đối chiếu: số hệ thống, số thực tế và chênh lệch (tô màu) xếp dọc, nhãn cùng độ rộng để số thẳng cột */
function Reconcile({
  system,
  actual,
  diff,
}: {
  system: [string, number | null]
  actual: [string, number | null]
  diff: number
}) {
  const line = ([label, value]: [string, number | null]) => (
    <Group gap="xs" wrap="nowrap">
      <Text size="xs" c="dimmed" w={58}>
        {label}
      </Text>
      <Text size="sm" style={TABULAR}>
        {money(value)}
      </Text>
    </Group>
  )
  return (
    <Stack gap={0}>
      {line(system)}
      {line(actual)}
      <Text size="sm" fw={700} c={diffColor(diff)} style={TABULAR}>
        {differenceLabel(diff)}
      </Text>
    </Stack>
  )
}

const columns: DataTableColumn<ShiftRow>[] = [
  {
    name: 'code',
    label: 'Mã ca',
    width: 190,
    fixed: 'left',
    render: (s) => <CopyableCode code={s.code} />,
  },
  { name: 'staff', label: 'Nhân viên', render: (s) => s.openedByName },
  {
    name: 'time',
    label: 'Mở – Kết',
    render: (s) => (
      <Stack gap={0}>
        <Text size="sm" style={TABULAR}>
          {time(s.openedAt)} – {s.closedAt ? dayjs(s.closedAt).format('HH:mm') : '…'}
        </Text>
        {s.overdue && (
          <Text size="xs" c="var(--tone-danger-fg)" fw={600}>
            Mở quá giờ, chưa kết
          </Text>
        )}
      </Stack>
    ),
  },
  {
    name: 'cash',
    label: 'Tiền mặt',
    render: (s) =>
      s.status !== 'OPEN' && (
        <Reconcile
          system={['Dự kiến', s.expectedCash]}
          actual={['Thực đếm', s.countedCash]}
          diff={s.difference ?? 0}
        />
      ),
  },
  {
    name: 'transfer',
    label: 'Chuyển khoản',
    render: (s) =>
      s.status !== 'OPEN' && (
        <Reconcile
          system={['Hệ thống', s.transferTotal]}
          // Ca kết trước khi lưu chênh lệch chuyển khoản: coi như khớp
          actual={['App NH', (s.transferTotal ?? 0) + (s.transferDifference ?? 0)]}
          diff={s.transferDifference ?? 0}
        />
      ),
  },
  { name: 'status', label: 'Trạng thái', render: (s) => <ShiftStatusBadge status={s.status} /> },
]

const rowKey = (s: ShiftRow) => s.id

export default function ShiftsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { status, setStatus, page, setPage } = useListParams(STATUSES)
  const today = dayjs()
  const from = searchParams.get('from') ?? today.subtract(29, 'day').format(DATE)
  const to = searchParams.get('to') ?? today.format(DATE)

  const { data, isLoading, isError, refetch } = useShifts({
    from,
    to,
    ...(status !== 'ALL' && { status }),
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  })
  const { data: summary } = useShiftSummary()

  const handleRetry = () => refetch()
  const handleStatusChange = (value: string | null) => setStatus(value as ShiftStatus | 'ALL')
  // Đổi khoảng ngày thì về trang 1; chọn đủ hai đầu mới áp dụng
  const handleRangeChange = ([start, end]: DatesRangeValue) => {
    if (!start || !end) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('from', dayjs(start).format(DATE))
        next.set('to', dayjs(end).format(DATE))
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }
  const rowProps = (s: ShiftRow) => ({
    onClick: () => navigate(PATHS.shiftDetail(s.id)),
    style: { cursor: 'pointer' },
  })

  const open = summary?.openShift
  const tiles = (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
      <StatTile
        label="Ca đang mở"
        value={open ? open.openedByName : 'Không có'}
        delta={open ? `${open.code} · từ ${time(open.openedAt)}` : undefined}
        trend={open?.overdue ? 'down' : 'flat'}
      />
      <StatTile label="Chờ duyệt" value={summary ? `${summary.pendingApproval} ca` : ''} />
      <Anchor component={Link} to={PATHS.reportOperations} size="sm">
        Xem báo cáo vận hành
      </Anchor>
    </SimpleGrid>
  )

  const filters = (
    <Group>
      <DatePickerInput
        type="range"
        w={260}
        valueFormat="DD/MM/YYYY"
        leftSection={<LuCalendar size={16} />}
        maxDate={new Date()}
        allowSingleDateInRange
        value={[dayjs(from).toDate(), dayjs(to).toDate()]}
        onChange={handleRangeChange}
      />
      <Select
        {...FILTER_SELECT_PROPS}
        w={240}
        data={STATUS_OPTIONS}
        value={status}
        onChange={handleStatusChange}
        allowDeselect={false}
      />
    </Group>
  )

  const empty =
    status !== 'ALL' ? (
      <EmptyState
        icon={<LuSearchX size={32} />}
        title="Không có ca phù hợp"
        description={`Không có ca "${SHIFT_STATUS_LABEL[status]}" trong khoảng ngày này.`}
      />
    ) : (
      <EmptyState
        icon={<LuWalletCards size={32} />}
        title="Chưa có ca nào"
        description="Các ca mở trong khoảng ngày đã chọn sẽ hiện ở đây."
      />
    )

  const description = `${dayjs(from).format('DD/MM/YYYY')} – ${dayjs(to).format('DD/MM/YYYY')}`

  return (
    <ListPage<ShiftRow>
      title="Đối chiếu tiền cuối ca"
      description={description}
      info={PAGE_INFO}
      notice={tiles}
      filters={filters}
      columns={columns}
      data={data?.content ?? []}
      rowKey={rowKey}
      rowProps={rowProps}
      loading={isLoading}
      error={isError}
      onRetry={handleRetry}
      page={page}
      totalPages={data?.page.totalPages ?? 0}
      onPageChange={setPage}
      empty={empty}
    />
  )
}
