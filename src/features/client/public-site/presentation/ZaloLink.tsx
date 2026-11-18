import { LuMessageCircle } from 'react-icons/lu'

interface ZaloLinkProps {
  phone: string | null
  /** Kiểu nút viền sáng trên nền navy (lời kêu gọi cuối trang) hay kiểu liên kết chữ (footer). */
  asButton?: boolean
}

/** Liên kết "Chat Zalo" tới số của tiệm, mở tab mới. Không có số thì không render. */
export function ZaloLink({ phone, asButton = false }: ZaloLinkProps) {
  if (!phone) return null
  return (
    <a
      href={`https://zalo.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className={asButton ? 'pub-btn pub-btn--on-dark pub-btn--lg' : 'pub-link'}
    >
      <LuMessageCircle size={18} aria-hidden="true" />
      Chat Zalo
      <span className="sr-only"> (mở tab mới)</span>
    </a>
  )
}
