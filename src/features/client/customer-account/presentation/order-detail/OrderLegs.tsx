import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { CopyCodeButton, EntityCode } from '@/shared/client/ui'
import { formatMoney } from '@/shared/common/lib/format'
import type { CustomerOrderDetail } from '../../domain/types'

const joinAddress = (detail: string | null, area: string | null) =>
  [detail, area].filter(Boolean).join(', ')
const feeText = (fee: number | null) =>
  fee === null ? '' : fee === 0 ? 'Miễn phí' : formatMoney(fee)

function Leg({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section className="pub-card p-4">
      <h2 className="mb-3 text-(length:--pub-text-xl)">{title}</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-(--pub-space-2) gap-y-3 rounded-(--pub-radius-md) bg-(--pub-primary-soft)/40 px-4 py-3 text-(length:--pub-text-sm)">
        {rows.map(([k, v]) => (
          <div key={k} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-(--pub-ink-muted)">{k}</dt>
            <dd className="break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Ẩn với đơn OFFLINE (fulfillment null). */
export function OrderLegs({ order }: { order: CustomerOrderDetail }) {
  const f = order.fulfillment
  if (!f) return null
  const pickup = f.dropoffMethod === 'PICKUP'
  const delivery = f.returnMethod === 'DELIVERY'
  const code = (c: string | null) =>
    c ? (
      <span className="inline-flex items-center gap-1">
        <EntityCode code={c} />
        <CopyCodeButton code={c} label="Sao chép mã vận đơn" />
      </span>
    ) : (
      ''
    )
  const send: [string, ReactNode][] = [
    ['Hình thức', pickup ? 'Nhân viên tới lấy' : 'Bạn mang đồ tới tiệm'],
  ]
  if (pickup) {
    send.push(
      ['Địa chỉ lấy', joinAddress(f.pickupAddress, f.pickupAreaName)],
      ['Thời gian lấy', f.appointmentAt ? dayjs(f.appointmentAt).format('DD/MM/YYYY HH:mm') : ''],
      ['Phí lấy đồ', feeText(f.pickupFee)],
      ['Mã vận đơn lấy đồ', code(f.pickupTrackingCode)],
    )
  }
  const recv: [string, ReactNode][] = [
    ['Hình thức', delivery ? 'Giao tận nơi' : 'Bạn tới tiệm nhận'],
  ]
  if (delivery) {
    recv.push(
      ['Địa chỉ giao', joinAddress(f.deliveryAddress, f.deliveryAreaName)],
      ['Dự kiến nhận', order.dueAt ? dayjs(order.dueAt).format('DD/MM/YYYY') : ''],
      ['Phí giao đồ', feeText(f.deliveryFee)],
      ['Mã vận đơn giao đồ', code(f.deliveryTrackingCode)],
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      <Leg title="Gửi đồ" rows={send} />
      <Leg title="Nhận đồ" rows={recv} />
    </div>
  )
}
