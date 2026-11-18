import { Button, Card, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { LuCloudOff, LuWalletCards } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import {
  diffColor,
  differenceLabel,
  type ShiftRow,
  ShiftStatusBadge,
  useShifts,
} from '@/features/admin/shifts'
import { type DataTableColumn, DataTable, EmptyState, InfoLabel, Money } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

const DASH = '—'
const time = (iso: string) => dayjs(iso).format('HH:mm')
const rowKey = (s: ShiftRow) => s.id

// Ca đang mở chưa kết nên chưa có số liệu tiền
const moneyCell = (v: number | null) => (v === null ? DASH : <Money value={v} />)

const COLUMNS: DataTableColumn<ShiftRow>[] = [
  {
    name: 'shift',
    label: 'Ca',
    render: (s) =>
      `${s.openedByName} · ${time(s.openedAt)} – ${s.closedAt ? time(s.closedAt) : '…'}`,
  },
  {
    name: 'cash',
    label: 'Tiền mặt theo sổ',
    width: 140,
    render: (s) => moneyCell(s.expectedCash),
  },
  {
    name: 'transfer',
    label: 'Chuyển khoản',
    width: 120,
    render: (s) => moneyCell(s.transferTotal),
  },
  {
    name: 'diff',
    label: 'Chênh lệch',
    width: 130,
    render: (s) =>
      s.difference === null ? (
        DASH
      ) : (
        <span style={{ color: diffColor(s.difference) }}>{differenceLabel(s.difference)}</span>
      ),
  },
  {
    name: 'status',
    label: 'Trạng thái',
    width: 110,
    render: (s) => <ShiftStatusBadge status={s.status} />,
  },
]

export function ShiftReconcileCard() {
  const navigate = useNavigate()
  const today = dayjs().format('YYYY-MM-DD')
  const { data, isLoading, isError, refetch } = useShifts({
    from: today,
    to: today,
    page: 0,
    size: 20,
  })

  const handleRetry = () => refetch()
  const rowProps = (s: ShiftRow) => ({
    onClick: () => navigate(PATHS.shiftDetail(s.id)),
    style: { cursor: 'pointer' },
  })

  const empty = isError ? (
    <EmptyState
      icon={<LuCloudOff size={32} />}
      title="Không tải được ca làm việc"
      description="Vui lòng kiểm tra kết nối rồi thử lại."
      action={<Button onClick={handleRetry}>Thử lại</Button>}
    />
  ) : (
    <EmptyState
      icon={<LuWalletCards size={32} />}
      title="Hôm nay chưa có ca nào"
      description="Các ca mở trong hôm nay sẽ hiện ở đây."
    />
  )

  return (
    <Card style={{ flex: '1 1 520px', minWidth: 0 }}>
      <Title order={5} mb="md">
        <InfoLabel info="Tiền mặt theo sổ = tiền đầu ca + thu − chi. Doanh thu không phụ thuộc ca.">
          Đối chiếu cuối ca hôm nay
        </InfoLabel>
      </Title>
      <DataTable
        columns={COLUMNS}
        data={isError ? [] : (data?.content ?? [])}
        rowKey={rowKey}
        rowProps={rowProps}
        loading={isLoading}
        empty={empty}
      />
    </Card>
  )
}
