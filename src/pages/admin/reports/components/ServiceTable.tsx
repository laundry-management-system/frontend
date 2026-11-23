import { capRows, type ServiceRow, serviceShare } from '@/features/admin/reports'
import { CapNotice } from './CapNotice'
import { UNIT_LABEL } from '@/features/admin/services'
import { formatNumber } from '@/shared/common/lib/format'
import { type DataTableColumn, DataTable, EmptyState, Money } from '@/shared/admin/ui'
import { LuTags } from 'react-icons/lu'

type Row = ServiceRow & { pct: number }

const pct = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })
const rowKey = (r: Row) => r.serviceId ?? 'other'

const COLUMNS: DataTableColumn<Row>[] = [
  { name: 'service', label: 'Dịch vụ', render: (r) => r.serviceName },
  {
    name: 'orders',
    label: 'Lượt sử dụng',
    width: 150,
    align: 'center',
    render: (r) => formatNumber(r.orderCount),
  },
  {
    name: 'quantity',
    label: 'Tổng KL / SL',
    width: 140,
    render: (r) => (r.unit ? `${formatNumber(r.quantity)} ${UNIT_LABEL[r.unit]}` : '—'),
  },
  {
    name: 'revenue',
    label: 'Doanh thu',
    width: 150,
    render: (r) => <Money value={r.revenue} />,
  },
  {
    name: 'pct',
    label: 'Tỉ trọng',
    align: 'center',
    width: 100,
    render: (r) => `${pct.format(r.pct)}%`,
  },
]

const EMPTY = (
  <EmptyState
    icon={<LuTags size={32} />}
    title="Chưa có dịch vụ nào được dùng"
    description="Doanh thu theo dịch vụ của các đơn nhận trong kỳ sẽ hiện ở đây."
  />
)

interface ServiceTableProps {
  rows: ServiceRow[]
}

export function ServiceTable({ rows }: ServiceTableProps) {
  const { shown, truncated } = capRows(rows)
  return (
    <>
      <DataTable columns={COLUMNS} data={serviceShare(shown)} rowKey={rowKey} empty={EMPTY} />
      <CapNotice truncated={truncated} />
    </>
  )
}
