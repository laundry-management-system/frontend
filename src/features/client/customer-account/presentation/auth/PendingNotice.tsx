import { LuClock } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { formatPhone } from '@/shared/common/lib/format'
import { PATHS } from '@/shared/common/config/paths'

interface PendingNoticeProps {
  storePhone?: string
}

export function PendingNotice({ storePhone }: PendingNoticeProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-(--pub-radius-lg) bg-(--pub-accent-soft) p-6"
    >
      <LuClock size={32} className="text-(--pub-accent-ink)" aria-hidden="true" />
      <h2 className="text-(length:--pub-text-xl) font-semibold">
        Tài khoản đang chờ tiệm kích hoạt
      </h2>
      <p>
        Tiệm sẽ gọi xác nhận số điện thoại của bạn trước khi kích hoạt. Sau khi được kích hoạt, bạn
        có thể đăng nhập để xem đơn của mình.
      </p>
      {storePhone && (
        <p>
          Cần gấp? Gọi{' '}
          <a href={`tel:${storePhone}`} className="font-semibold underline underline-offset-4">
            {formatPhone(storePhone)}
          </a>
          .
        </p>
      )}
      <Link to={PATHS.landing} className="pub-btn pub-btn--ghost self-start">
        Về trang chủ
      </Link>
    </div>
  )
}
