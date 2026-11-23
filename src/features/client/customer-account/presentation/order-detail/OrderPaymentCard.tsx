import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { customerKeys } from '../../application/queryKeys'
import type { CustomerOrderDetail } from '../../domain/types'
import { PaymentQrModal } from '../account/PaymentQrModal'
import { OrderMoneySummary } from './OrderMoneySummary'

export function OrderPaymentCard({ order: o }: { order: CustomerOrderDetail }) {
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)
  const online = o.channel === 'ONLINE' && o.fulfillment?.returnMethod === 'DELIVERY'
  const paid = o.paymentStatus === 'PAID'
  const payable = online && !paid && o.status === 'COMPLETED'
  const close = () => {
    setOpened(false)
    void queryClient.invalidateQueries({ queryKey: customerKeys.order(o.orderCode) })
  }
  return (
    <section className="pub-card grid gap-3 p-4 text-(length:--pub-text-md)">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-(length:--pub-text-xl)">Thanh toán</h2>
        {(online || paid) && (
          <span
            className={`rounded-(--pub-radius-pill) px-3 py-0.5 text-(length:--pub-text-sm) font-semibold ${paid ? 'bg-(--pub-accent-soft) text-(--pub-accent-ink)' : 'bg-(--pub-primary-soft)'}`}
          >
            {paid ? 'Đã thanh toán' : o.paymentClaimedAt ? 'Chờ tiệm xác nhận' : 'Chưa thanh toán'}
          </span>
        )}
      </div>
      <OrderMoneySummary order={o} />
      {!online && !paid && (
        <p className="text-(--pub-ink-muted)">Thanh toán tại tiệm khi nhận đồ.</p>
      )}
      {online && !paid && !payable && (
        <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
          Bạn thanh toán được khi đơn hoàn thành.
        </p>
      )}
      {payable && (
        <>
          <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
            Tiệm sẽ giao đồ sau khi xác nhận thanh toán.
          </p>
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="pub-btn pub-btn--primary w-full"
          >
            Thanh toán
          </button>
          <PaymentQrModal orderCode={o.orderCode} opened={opened} onClose={close} />
        </>
      )}
    </section>
  )
}
