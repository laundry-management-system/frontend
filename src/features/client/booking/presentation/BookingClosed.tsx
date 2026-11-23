import { Alert } from '@mantine/core'
import { LuCircleAlert } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { formatPhone } from '@/shared/common/lib/format'
import { PATHS } from '@/shared/common/config/paths'

interface BookingClosedProps {
  storePhone: string | null
  openingTime: string
  closingTime: string
}

/** Màn chặn toàn trang khi tiệm tắt nhận đặt đơn online; không có nút tra cứu (FR-030). */
export function BookingClosed({ storePhone, openingTime, closingTime }: BookingClosedProps) {
  return (
    <section className="bk-card flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-6">
        <Alert
          color="orange"
          icon={<LuCircleAlert size={20} aria-hidden="true" />}
          title="Tiệm tạm ngưng nhận đặt đơn online"
        >
          Anh/chị vui lòng gọi tiệm{storePhone ? ` theo số ${formatPhone(storePhone)}` : ''} để được
          hỗ trợ. Giờ mở cửa: {openingTime.slice(0, 5)} – {closingTime.slice(0, 5)}.
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`${PATHS.landing}#pricing`}
            className="pub-btn pub-btn--ghost pub-btn--lg w-full"
          >
            Xem bảng giá
          </Link>
          <Link to={PATHS.landing} className="pub-btn pub-btn--primary pub-btn--lg w-full">
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  )
}
