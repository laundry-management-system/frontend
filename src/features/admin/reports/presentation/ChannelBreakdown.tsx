import { Badge } from '@mantine/core'
import { ORDER_CHANNEL_LABEL } from '@/features/admin/orders'
import { type DataTableColumn, DataTable, Money } from '@/shared/admin/ui'
import { formatNumber } from '@/shared/common/lib/format'
import type { ChannelRow } from '../domain/types'

interface ChannelBreakdownProps {
  rows: ChannelRow[]
  /** Tên cột số lượng: "Số thanh toán" hoặc "Số đơn" */
  countLabel: string
}

const rowKey = (r: ChannelRow) => r.channel

/** Tách Online / Tại quầy; luôn đủ hai kênh, không phụ thuộc bộ lọc kênh của trang. */
export function ChannelBreakdown({ rows, countLabel }: ChannelBreakdownProps) {
  const sum = rows.reduce((s, r) => s + r.amount, 0)
  const columns: DataTableColumn<ChannelRow>[] = [
    {
      name: 'channel',
      label: 'Kênh',
      render: (r) => (
        <Badge variant="light" color={r.channel === 'ONLINE' ? 'blue' : 'gray'} size="sm">
          {ORDER_CHANNEL_LABEL[r.channel]}
        </Badge>
      ),
    },
    {
      name: 'count',
      label: countLabel,
      align: 'center',
      width: 120,
      render: (r) => formatNumber(r.count),
    },
    { name: 'amount', label: 'Doanh thu', width: 140, render: (r) => <Money value={r.amount} /> },
    {
      name: 'pct',
      label: 'Tỉ trọng',
      align: 'center',
      width: 90,
      render: (r) => (sum > 0 ? `${Math.round((r.amount * 1000) / sum) / 10}%` : ''),
    },
  ]
  return <DataTable columns={columns} data={rows} rowKey={rowKey} />
}
