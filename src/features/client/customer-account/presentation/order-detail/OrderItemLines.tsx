import { useState } from 'react'
import { formatMoney } from '@/shared/common/lib/format'
import type { CustomerOrderDetail, CustomerOrderDetailItem } from '../../domain/types'
import { PhotoLightbox } from './PhotoLightbox'

const PILL = 'rounded-(--pub-radius-pill) px-2.5 py-px text-(length:--pub-text-sm) font-semibold'

function ItemLine({ item }: { item: CustomerOrderDetailItem }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <li className="grid gap-1.5 border-t border-(--pub-border) py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
        <span>{item.serviceName}</span>
        {item.extra && <span className={`${PILL} bg-(--pub-primary-soft)`}>Phát sinh thêm</span>}
      </div>
      <div className="flex justify-between gap-3 text-(--pub-ink-muted)">
        <span>
          {item.quantity} {item.unit} × {formatMoney(item.unitPrice)}
        </span>
        <b className="text-(--pub-ink)">{formatMoney(item.lineTotal)}</b>
      </div>
      {item.conditionTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.conditionTags.map((t) => (
            <span key={t} className={`${PILL} bg-(--pub-danger-soft) text-(--pub-danger)`}>
              {t}
            </span>
          ))}
        </div>
      )}
      {item.images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {item.images.map((im, k) => (
            <button
              key={im.url}
              type="button"
              onClick={() => setOpen(k)}
              aria-label={`Xem ảnh ${k + 1} của ${item.serviceName}`}
              className="size-18 overflow-hidden rounded-(--pub-radius-md) border border-(--pub-border) bg-neutral-200 p-0"
            >
              <img
                src={im.url}
                alt={`Ảnh tiệm chụp: ${item.serviceName} ${k + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">Chưa có ảnh</p>
      )}
      <PhotoLightbox
        title={item.serviceName}
        images={item.images}
        index={open}
        onClose={() => setOpen(null)}
      />
    </li>
  )
}

export function OrderItemLines({ order }: { order: CustomerOrderDetail }) {
  return (
    <section className="pub-card grid gap-3 p-4">
      <h2 className="text-(length:--pub-text-xl)">Đồ của bạn</h2>
      {order.classified ? (
        <ul>
          {order.items.map((it, i) => (
            <ItemLine key={`${it.serviceName}-${i}`} item={it} />
          ))}
        </ul>
      ) : (
        <>
          <ul className="grid gap-1">
            {order.requestedServices.map((s) => (
              <li key={s.serviceName} className="font-semibold">
                {s.serviceName}
              </li>
            ))}
          </ul>
          <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
            Chờ phân loại · Giá chốt sau khi cân
          </p>
        </>
      )}
    </section>
  )
}
