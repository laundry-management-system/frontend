import { LuCheck } from 'react-icons/lu'
import { UNIT_LABEL } from '@/features/client/public-site'
import { formatMoney } from '@/shared/common/lib/format'
import type { BookingUnit } from '../domain/types'

export interface ServiceSummaryItem {
  key: number
  name: string
  /** Thiếu khi không tìm thấy dịch vụ trong danh sách hiện tại: bỏ dòng giá. */
  priced?: { price: number; unit: BookingUnit; expressSurcharge?: number | null }
}

const ROW = 'flex min-h-14 items-center justify-between gap-3 px-4 py-2'

/** Danh sách dịch vụ đã chọn (Bước 5 và màn thành công): mỗi dịch vụ một dòng, đồ trắng là dòng tuỳ chọn riêng bên dưới. */
export function ServiceSummaryList({
  items,
  whites,
  express,
}: {
  items: ServiceSummaryItem[]
  whites: boolean
  express: boolean
}) {
  const list = (
    <ul className="divide-y divide-(--pub-border) rounded-(--pub-radius-xl) border border-(--pub-border)">
      {items.map((i) => (
        <li key={i.key} className={ROW}>
          <div className="min-w-0">
            <p className="bk-name">{i.name}</p>
            {i.priced && (
              <p className="bk-unit">
                {formatMoney(i.priced.price + (express ? (i.priced.expressSurcharge ?? 0) : 0))}/
                {UNIT_LABEL[i.priced.unit]}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
  if (!whites) return list
  return (
    <div className="flex flex-col gap-3">
      {list}
      <p className="flex items-center gap-2 rounded-(--pub-radius-xl) bg-(--pub-accent-soft) px-4 py-3 text-(--pub-accent-ink)">
        <LuCheck size={16} aria-hidden="true" className="flex-none" />
        Giặt riêng đồ trắng
      </p>
    </div>
  )
}
