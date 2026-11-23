import { Alert } from '@mantine/core'
import { LuCircleAlert } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { formatPhone } from '@/shared/common/lib/format'
import { PATHS } from '@/shared/common/config/paths'

interface SubmitErrorAlertProps {
  /** block: 400 không `errors`; rateLimit: 429; generic: mạng / 5xx / khác. */
  variant: 'block' | 'rateLimit' | 'generic'
  /** `detail` của BE, hiện nguyên; bỏ qua ở biến thể generic. */
  detail?: string
  storePhone: string | null
  onRetry: () => void
}

/** Alert lỗi gửi ở Bước 5; luôn hướng dẫn gọi tiệm, không có nút tra cứu (FR-030). */
export function SubmitErrorAlert({ variant, detail, storePhone, onRetry }: SubmitErrorAlertProps) {
  const phone = storePhone ? formatPhone(storePhone) : ''
  const message =
    variant === 'generic'
      ? `Không gửi được yêu cầu. Vui lòng thử lại hoặc gọi tiệm${phone ? ` ${phone}` : ''}.`
      : detail
  return (
    <Alert color="red" icon={<LuCircleAlert size={20} aria-hidden="true" />} role="alert">
      <p>{message}</p>
      {variant === 'rateLimit' && phone && <p>Cần hỗ trợ, anh/chị vui lòng gọi tiệm {phone}.</p>}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        {variant === 'block' ? (
          <>
            {storePhone && (
              <a href={`tel:${storePhone}`} className="pub-btn pub-btn--primary w-full">
                Gọi tiệm
              </a>
            )}
            <Link to={PATHS.landing} className="pub-btn pub-btn--ghost w-full">
              Về trang chủ
            </Link>
          </>
        ) : (
          <button type="button" onClick={onRetry} className="pub-btn pub-btn--primary w-full">
            Gửi lại
          </button>
        )}
      </div>
    </Alert>
  )
}
