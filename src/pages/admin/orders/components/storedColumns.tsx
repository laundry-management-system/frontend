import { Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { CustomerCell } from '@/features/admin/customers'
import type { StoredOrder } from '@/features/admin/orders'
import { formatDate, formatPhone } from '@/shared/common/lib/format'
import { CopyableCode, type DataTableColumn, StatusBadge } from '@/shared/admin/ui'

export const STORED_COLUMNS: DataTableColumn<StoredOrder>[] = [
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
    fixed: 'left',
    render: (o) => (
      <Stack gap={0}>
        <CustomerCell customer={{ fullName: o.customerName, isVip: o.customerVip }} />
        <Text size="sm" c="dimmed">
          {formatPhone(o.customerPhone)}
        </Text>
      </Stack>
    ),
  },
  {
    name: 'completedAt',
    label: 'Hoàn thành',
    width: 120,
    render: (o) => formatDate(o.completedAt),
  },
  {
    name: 'days',
    label: 'Số ngày tồn',
    width: 120,
    align: 'center',
    render: (o) => <Text fw={700}>{o.daysInStorage}</Text>,
  },
  {
    name: 'notify',
    label: 'Số lần nhắc',
    width: 130,
    render: (o) =>
      o.notifyCount === 0 ? (
        <Text c="dimmed">Chưa nhắc</Text>
      ) : (
        <Stack gap={0}>
          <Text>{o.notifyCount} lần</Text>
          {o.lastNotifiedAt && (
            <Text size="xs" c="dimmed">
              Lần cuối {dayjs(o.lastNotifiedAt).format('DD/MM')}
            </Text>
          )}
        </Stack>
      ),
  },
  { name: 'shelf', label: 'Vị trí kệ', width: 90, render: (o) => o.shelfLocation ?? '—' },
  {
    name: 'payment',
    label: 'Thanh toán',
    width: 150,
    render: (o) => (
      <StatusBadge group="payment" statusKey={o.paymentStatus.toLowerCase()} size="sm" />
    ),
  },
]
