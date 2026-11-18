import { type Customer, CustomerCell, CustomerStatusText } from '@/features/admin/customers'
import { formatDate, formatMoney, formatPhone } from '@/shared/common/lib/format'
import { CopyableCode, type DataTableColumn } from '@/shared/admin/ui'

export const CUSTOMER_COLUMNS: DataTableColumn<Customer>[] = [
  {
    name: 'code',
    label: 'Mã KH',
    width: 150,
    fixed: 'left',
    render: (c) => <CopyableCode code={c.code} />,
  },
  {
    name: 'fullName',
    label: 'Họ và tên',
    fixed: 'left',
    render: (c) => <CustomerCell customer={c} />,
  },
  {
    name: 'phone',
    label: 'Số điện thoại',
    width: 140,
    render: (c) => formatPhone(c.phone),
  },
  {
    name: 'orderCount',
    label: 'Số đơn',
    width: 100,
    align: 'center',
    render: (c) => c.orderCount ?? '',
  },
  {
    name: 'totalSpent',
    label: 'Tổng chi tiêu',
    width: 140,
    render: (c) => (c.totalSpent === null ? '' : formatMoney(c.totalSpent)),
  },
  {
    name: 'lastOrderAt',
    label: 'Đơn gần nhất',
    width: 130,
    align: 'center',
    render: (c) => (c.lastOrderAt ? formatDate(c.lastOrderAt) : ''),
  },
  {
    name: 'status',
    label: 'Trạng thái',
    width: 140,
    render: (c) => <CustomerStatusText status={c.status} />,
  },
]
