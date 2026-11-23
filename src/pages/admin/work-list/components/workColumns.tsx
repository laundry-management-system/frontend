import { formatPhone } from '@/shared/common/lib/format'
import { Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import {
  dueHint,
  isLate,
  isUnclassified,
  type OrderListItem,
  WorkActionButton,
} from '@/features/admin/orders'
import { CopyableCode, type DataTableColumn, StatusBadge } from '@/shared/admin/ui'

const STATUS_KEY = { RECEIVED: 'new', PROCESSING: 'processing' } as const

/** Cột của bảng Danh sách công việc; `now` để cờ TRỄ / thời gian còn lại tự cập nhật. */
export const workColumns = (now: number): DataTableColumn<OrderListItem>[] => [
  {
    name: 'code',
    label: 'Mã đơn',
    width: 190,
    fixed: 'left',
    render: (o) => <CopyableCode code={o.orderCode} />,
  },
  {
    name: 'customer',
    label: 'Khách hàng',
    render: (o) => (
      <Stack gap={0}>
        <Text fw={500}>{o.customerName}</Text>
        <Text size="sm" c="dimmed">
          {formatPhone(o.customerPhone)}
        </Text>
      </Stack>
    ),
  },
  {
    name: 'dueAt',
    label: 'Hẹn trả',
    width: 150,
    render: (o) => (
      <Stack gap={0}>
        <Text fw={isLate(o, now) ? 700 : 500}>{dayjs(o.dueAt).format('DD/MM HH:mm')}</Text>
        <Text size="xs" c={isLate(o, now) ? 'danger' : 'dimmed'}>
          {dueHint(o, now)}
        </Text>
      </Stack>
    ),
  },
  {
    name: 'type',
    label: 'Hình thức',
    width: 150,
    render: (o) =>
      isUnclassified(o) ? (
        <StatusBadge group="flag" statusKey="unclassified" size="sm" />
      ) : (
        <Text size="sm">{o.washModeName ?? '—'}</Text>
      ),
  },
  {
    name: 'status',
    label: 'Trạng thái',
    width: 130,
    render: (o) =>
      o.status === 'RECEIVED' || o.status === 'PROCESSING' ? (
        <StatusBadge group="order" statusKey={STATUS_KEY[o.status]} size="sm" />
      ) : null,
  },
  {
    name: 'late',
    label: 'Trễ',
    width: 90,
    render: (o) =>
      isLate(o, now) ? (
        <StatusBadge group="flag" statusKey="late" size="sm" />
      ) : (
        <Text c="dimmed">—</Text>
      ),
  },
  {
    name: 'action',
    label: '',
    width: 160,
    align: 'right',
    fixed: 'right',
    render: (o) => <WorkActionButton order={o} />,
  },
]
