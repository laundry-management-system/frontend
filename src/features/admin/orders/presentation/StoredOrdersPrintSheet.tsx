import dayjs from 'dayjs'
import { EntityCode } from '@/shared/admin/ui'
import type { StoredOrder } from '../domain/types'

interface StoredOrdersPrintSheetProps {
  rows: StoredOrder[]
  overdueDays: number
  now: number
}

/** Bản in khổ A4 (BM13) của các đơn tồn đang hiện; chỉ hiện khi in (dùng chung cơ chế .print-area). */
export function StoredOrdersPrintSheet({ rows, overdueDays, now }: StoredOrdersPrintSheetProps) {
  return (
    <div className="print-area">
      <div className="text-print-title">Danh sách đồ tồn chưa nhận</div>
      <div className="text-print-small" style={{ marginBottom: 8 }}>
        Ngày lập {dayjs(now).format('DD/MM/YYYY')} · số ngày quy định: {overdueDays} ngày ·{' '}
        {rows.length} đơn
      </div>
      <table className="text-print-body" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid currentColor' }}>
            <th>STT</th>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Hoàn thành</th>
            <th>Số ngày tồn</th>
            <th>Số lần nhắc</th>
            <th>Vị trí kệ</th>
            <th>Thanh toán</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o, i) => (
            <tr key={o.orderId} style={{ borderBottom: '1px solid var(--ds-border)' }}>
              <td>{i + 1}</td>
              <td>
                <EntityCode code={o.orderCode} size="sm" />
              </td>
              <td>{o.customerName}</td>
              <td>{o.customerPhone}</td>
              <td>{dayjs(o.completedAt).format('DD/MM/YYYY')}</td>
              <td>{o.daysInStorage}</td>
              <td>{o.notifyCount}</td>
              <td>{o.shelfLocation ?? '—'}</td>
              <td>{o.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
