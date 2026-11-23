import type { ReactNode } from 'react'
import { formatMoney } from '@/shared/common/lib/format'
import type { CustomerOrderDetail } from '../../domain/types'
import { VoucherChip } from '../VoucherChip'

export function Breakdown({
  order,
  chipActions,
}: {
  order: CustomerOrderDetail
  chipActions?: ReactNode
}) {
  const { money: m, fulfillment: f } = order
  const extra = order.items.filter((i) => i.extra).reduce((sum, i) => sum + i.lineTotal, 0)
  const rows: [string, number][] = [
    ['Tiền dịch vụ', m.subtotal],
    ['Giặt riêng đồ trắng', m.whitesFee],
    ['Giặt nhanh', m.expressFee],
    ['Giảm giá sự cố', -m.incidentDiscount],
    ['Voucher', -m.discountAmount],
    ['Phí lấy đồ', f?.pickupFee ?? 0],
    ['Phí giao đồ', f?.deliveryFee ?? 0],
  ]
  const money = (v: number) => (v < 0 ? `−${formatMoney(-v)}` : formatMoney(v))
  return (
    <dl className="grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-(length:--pub-text-sm)">
      <dt className="text-(--pub-ink-muted)">Hình thức giặt</dt>
      <dd className="text-right">{order.washModeName}</dd>
      {rows
        .filter(([label, v]) => v !== 0 || label === 'Tiền dịch vụ')
        .map(([label, v]) => (
          <div key={label} className="contents">
            <dt className="flex items-center gap-2 text-(--pub-ink-muted)">
              {label}
              {label === 'Voucher' && m.voucherCode && (
                <>
                  <VoucherChip code={m.voucherCode} />
                  {chipActions}
                </>
              )}
            </dt>
            <dd
              className={`text-right ${label === 'Voucher' ? 'font-semibold text-(--pub-success)' : ''}`}
            >
              {money(v)}
            </dd>
            {label === 'Tiền dịch vụ' && extra > 0 && (
              <dd className="col-span-full -mt-1 pl-3 text-(--pub-ink-muted)">
                trong đó phát sinh thêm {formatMoney(extra)}
              </dd>
            )}
          </div>
        ))}
      <div role="presentation" className="col-span-full mt-1 border-t border-(--pub-border)" />
      <dt className="text-(length:--pub-text-md) font-bold">Phải thu</dt>
      <dd className="text-right text-(length:--pub-text-md) font-bold">
        {formatMoney(m.payableAmount)}
      </dd>
    </dl>
  )
}
