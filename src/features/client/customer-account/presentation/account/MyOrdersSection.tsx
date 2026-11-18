import { Pagination, Skeleton } from '@mantine/core'
import { useState } from 'react'
import { LuInbox } from 'react-icons/lu'
import { formatDate, formatMoney } from '@/shared/common/lib/format'
import { useMyOrders } from '../../application/queries/useMyOrders'
import { ORDER_STATUS_LABEL } from '../../domain/orderStatus'

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
        <ul className="divide-y divide-(--pub-border)">
          {data.content.map((o) => (
            <li
              key={o.orderCode}
              className="grid gap-x-4 gap-y-1 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
            >
              <span className="font-(family-name:--pub-font-mono) font-semibold">
                {o.orderCode}
              </span>
              <span className="text-(--pub-ink-muted)">{formatDate(o.receivedAt)}</span>
              <span className="w-fit rounded-(--pub-radius-pill) bg-(--pub-primary-soft) px-3 py-0.5 text-(length:--pub-text-sm) font-semibold">
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              <span className="font-semibold sm:min-w-24 sm:text-right">
                {o.totalAmount === null ? 'Chưa tính' : formatMoney(o.totalAmount)}
              </span>
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
      <h2 id="don-cua-toi-title" className="mb-5 text-(length:--pub-text-xl)">
        Đơn của tôi
      </h2>
      {body}
    </section>
  )
}
