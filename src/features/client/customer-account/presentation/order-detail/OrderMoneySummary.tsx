import { formatMoney } from '@/shared/common/lib/format'
import { VoucherChip } from '../VoucherChip'
import type { CustomerOrderDetail } from '../../domain/types'

const feeText = (fee: number) => (fee === 0 ? 'Miễn phí' : formatMoney(fee))

export function OrderMoneySummary({ order: o }: { order: CustomerOrderDetail }) {
  const f = o.fulfillment
  const m = o.money
  const rows: [string, string, string?][] = [['Hình thức giặt', o.washModeName]]
  if (o.classified) {
    rows.push(['Tổng tiền dịch vụ', formatMoney(m.subtotal)])
    if (m.expressFee > 0) rows.push(['Phí giặt nhanh', formatMoney(m.expressFee)])
    if (m.whitesFee > 0) rows.push(['Giặt riêng đồ trắng', formatMoney(m.whitesFee)])
    if (m.discountAmount > 0)
      rows.push(['Giảm giá', `-${formatMoney(m.discountAmount)}`, m.voucherCode ?? undefined])
    if (m.incidentDiscount > 0) rows.push(['Giảm giá sự cố', `-${formatMoney(m.incidentDiscount)}`])
  }
  if (f?.dropoffMethod === 'PICKUP' && f.pickupFee !== null)
    rows.push(['Phí lấy đồ', feeText(f.pickupFee)])
  if (f?.returnMethod === 'DELIVERY' && f.deliveryFee !== null)
    rows.push(['Phí giao đồ', feeText(f.deliveryFee)])
  return (
    <div className="grid gap-1 text-(length:--pub-text-sm)">
      {rows.map(([k, v, code]) => (
        <div key={k} className="flex justify-between gap-3">
          <span className="flex items-center gap-2 text-(--pub-ink-muted)">
            {k}
            {code && <VoucherChip code={code} />}
          </span>
          <span className={code ? 'font-semibold text-(--pub-success)' : ''}>{v}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between gap-3 border-t border-(--pub-border) pt-3 text-(length:--pub-text-lg) font-bold">
        <span>Tổng cộng</span>
        <span>{o.classified ? formatMoney(m.payableAmount) : 'Chưa có'}</span>
      </div>
    </div>
  )
}
