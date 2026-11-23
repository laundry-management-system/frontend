import type { ReactNode } from 'react'

interface SummaryRowProps {
  label: ReactNode
  value: string
  /** Dòng phụ dưới nhãn, VD "5 kg × 25.000đ". */
  detail?: string
  /** Số tiền, ngày giờ, số điện thoại: không xuống dòng, chữ số đều cột. */
  numeric?: boolean
  /** Số tiền: như numeric, thêm font giá tiền. */
  money?: boolean
  strong?: boolean
}

/** Một dòng nhãn / giá trị dùng chung cho tạm tính, Bước 5 và màn thành công. */
export function SummaryRow({
  label,
  value,
  detail,
  numeric = false,
  money = false,
  strong = false,
}: SummaryRowProps) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${strong ? 'pt-1 font-semibold' : ''}`}
    >
      <dt className="min-w-0">
        {/* Dòng dịch vụ (có dòng phụ): tên màu chữ chính, số lượng × đơn giá nhỏ nhạt bên dưới; chỉ tổng được nhấn */}
        <span className={detail || strong ? '' : 'text-(--pub-ink-muted)'}>{label}</span>
        {detail && (
          <span className="block text-sm text-(--pub-ink-muted) tabular-nums">{detail}</span>
        )}
      </dt>
      <dd
        className={`text-right ${numeric || money ? 'whitespace-nowrap tabular-nums' : 'min-w-0'} ${money ? 'bk-money' : ''} ${strong ? 'bk-total' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}
