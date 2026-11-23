import { Pagination, Skeleton } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuInbox } from 'react-icons/lu'
import { CopyCodeButton } from '@/shared/client/ui'
import { PATHS } from '@/shared/common/config/paths'
import { formatDateTime, formatMoney } from '@/shared/common/lib/format'
import { customerKeys } from '../../application/queryKeys'
import { useMyOrders } from '../../application/queries/useMyOrders'
import type { CustomerOrder, OrderStatus } from '../../domain/types'
import { orderStatusLabel } from '../../domain/orderStatus'
import { PaymentQrModal } from './PaymentQrModal'

const STATUS_TONE: Partial<Record<OrderStatus, string>> = {
  CANCELLED: 'bg-(--pub-danger-soft) text-(--pub-danger)',
  COMPLETED: 'bg-(--pub-accent-soft) text-(--pub-accent-ink)',
  DELIVERED: 'bg-(--pub-accent-soft) text-(--pub-accent-ink)',
}
const DEFAULT_TONE = 'bg-(--pub-primary-soft)'

function OrderPayment({ order: o }: { order: CustomerOrder }) {
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)
  if (o.channel !== 'ONLINE' || o.fulfillment?.returnMethod !== 'DELIVERY') return null
  if (o.paymentStatus === 'PAID')
    return <span className="font-semibold text-(--pub-accent-ink)">Đã thanh toán</span>
  if (o.status !== 'COMPLETED') return null
  if (o.paymentClaimedAt)
    return <span className="font-semibold text-(--pub-ink-muted)">Chờ tiệm xác nhận</span>
  const close = () => {
    setOpened(false)
    void queryClient.invalidateQueries({ queryKey: [...customerKeys.all, 'orders'] })
  }
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpened(true)
        }}
        className="pub-btn pub-btn--primary relative z-10"
      >
        Thanh toán
      </button>
      <PaymentQrModal orderCode={o.orderCode} opened={opened} onClose={close} />
    </>
  )
}

export function MyOrdersSection() {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, refetch } = useMyOrders(page - 1)
  const handleRetry = () => refetch()

  let body
  if (data && data.content.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-2 py-8 text-center text-(--pub-ink-muted)">
        <LuInbox size={32} aria-hidden="true" />
        <p>Bạn chưa có đơn nào</p>
      </div>
    )
  } else if (data) {
    body = (
      <>
        <ul className="grid gap-3">
          {data.content.map((o) => (
            <li
              key={o.orderCode}
              className="relative grid gap-2 rounded-(--pub-radius-xl) border border-(--pub-border) bg-(--pub-surface) p-4 text-(length:--pub-text-md) transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-(--pub-shadow-md)"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex items-center gap-1">
                  <Link
                    to={PATHS.customerOrderDetail(o.orderCode)}
                    className="font-(family-name:--pub-font-mono) font-semibold after:absolute after:inset-0 after:content-['']"
                  >
                    {o.orderCode}
                  </Link>
                  <CopyCodeButton code={o.orderCode} />
                </div>
                <span
                  className={`w-fit rounded-(--pub-radius-pill) px-3 py-0.5 text-(length:--pub-text-sm) font-semibold ${STATUS_TONE[o.status] ?? DEFAULT_TONE}`}
                >
                  {orderStatusLabel(o)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 text-(--pub-ink-muted)">
                <span>
                  {o.channel === 'ONLINE' ? 'Đặt online' : 'Tại tiệm'} ·{' '}
                  {formatDateTime(o.receivedAt ?? o.createdAt)}
                </span>
                {o.status !== 'CANCELLED' && (
                  <span className="text-(length:--pub-text-lg) font-bold text-(--pub-ink)">
                    {!o.classified || o.payableAmount === null
                      ? 'Chưa có'
                      : formatMoney(o.payableAmount)}
                  </span>
                )}
              </div>
              <p className="text-(--pub-ink-muted)">
                {o.services.length} dịch vụ
                {o.services.some((s) => s.extra) ? ' · có dịch vụ phát sinh' : ''}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <OrderPayment order={o} />
                <span
                  aria-hidden="true"
                  className="ml-auto text-(length:--pub-text-sm) font-semibold text-(--pub-ink-muted)"
                >
                  Xem chi tiết ›
                </span>
              </div>
            </li>
          ))}
        </ul>
        {data.page.totalPages > 1 && (
          <Pagination
            className="mt-6"
            total={data.page.totalPages}
            value={page}
            onChange={setPage}
            aria-label="Phân trang đơn hàng"
          />
        )}
      </>
    )
  } else if (isPending) {
    body = <Skeleton h={200} radius="md" aria-hidden="true" />
  } else if (isError) {
    body = (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p>Vui lòng kiểm tra kết nối rồi thử lại.</p>
        <button type="button" onClick={handleRetry} className="pub-btn pub-btn--ghost">
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <section aria-labelledby="don-cua-toi-title" className="pub-card p-6">
      <h2 id="don-cua-toi-title" className="mb-5 text-(length:--pub-text-lg)">
        Đơn của tôi
      </h2>
      {body}
    </section>
  )
}
