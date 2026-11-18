import dayjs from 'dayjs'
import { EntityCode } from '@/shared/admin/ui'
import { ORDER_STATUS_LABEL, type OrderListItem } from '../domain/types'
import { isUnclassified } from '../domain/rules'
import { isLate } from '../domain/workList'

interface WorkListPrintSheetProps {
  title: string
  rows: OrderListItem[]
  now: number
}

const typeLabel = (o: OrderListItem) =>
  isUnclassified(o) ? 'Chưa phân loại' : o.orderType === 'EXPRESS' ? 'Giặt nhanh' : 'Thường'

/** Bản in khổ A4 của danh sách đang xem; chỉ hiện khi in (dùng chung cơ chế .print-area). */
export function WorkListPrintSheet({ title, rows, now }: WorkListPrintSheetProps) {
  return (
    <div className="print-area">
      <div className="text-print-title">{title}</div>
      <div className="text-print-small" style={{ marginBottom: 8 }}>
        In lúc {dayjs(now).format('HH:mm DD/MM/YYYY')} · {rows.length} đơn
      </div>
      <table className="text-print-body" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid currentColor' }}>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Hẹn trả</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>Trễ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid var(--ds-border)' }}>
              <td>
                <EntityCode code={o.orderCode} size="sm" />
              </td>
              <td>{o.customerName}</td>
              <td>{o.customerPhone}</td>
              <td>{dayjs(o.dueAt).format('DD/MM HH:mm')}</td>
              <td>{typeLabel(o)}</td>
              <td>{ORDER_STATUS_LABEL[o.status]}</td>
              <td>{isLate(o, now) ? 'TRỄ' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
