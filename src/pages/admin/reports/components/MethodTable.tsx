import { type DataTableColumn, DataTable, Money, StatusBadge } from '@/shared/admin/ui'
import { paymentShare, type RevenueReport } from '@/features/admin/reports'
import { formatNumber } from '@/shared/common/lib/format'

interface MethodRow {
  key: 'cash' | 'qr'
  count: number
  amount: number
  pct: number | null
}

const rowKey = (r: MethodRow) => r.key

const COLUMNS: DataTableColumn<MethodRow>[] = [
  {
    name: 'method',
    label: 'Phương thức',
    render: (r) => <StatusBadge group="payment-method" statusKey={r.key} size="sm" />,
  },
  {
    name: 'count',
    label: 'Số đơn',
    align: 'center',
    width: 90,
    render: (r) => formatNumber(r.count),
  },
  {
    name: 'amount',
    label: 'Số tiền',
    width: 140,
    render: (r) => <Money value={r.amount} />,
  },
  {
    name: 'pct',
    label: 'Tỉ trọng',
    align: 'center',
    width: 90,
    render: (r) => (r.pct === null ? '—' : `${r.pct}%`),
  },
]

interface MethodTableProps {
  summary: RevenueReport['summary']
}

export function MethodTable({ summary }: MethodTableProps) {
  const share = paymentShare(summary)
  const rows: MethodRow[] = [
    { key: 'cash', count: summary.cashCount, amount: summary.cash, pct: share?.cashPct ?? null },
    {
      key: 'qr',
      count: summary.bankTransferCount,
      amount: summary.bankTransfer,
      pct: share?.bankPct ?? null,
    },
  ]
  return <DataTable columns={COLUMNS} data={rows} rowKey={rowKey} />
}
