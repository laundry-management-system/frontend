import { LuCloudOff, LuRotateCw } from 'react-icons/lu'

interface SectionErrorProps {
  /** Tên phần bị lỗi, ví dụ "bảng giá". */
  what: string
  onRetry: () => void
}

/** Lỗi tải của một phần trên landing; phần khác vẫn hiện bình thường. */
export function SectionError({ what, onRetry }: SectionErrorProps) {
  return (
    <div
      role="alert"
      className="pub-card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center"
    >
      <span
        className="pub-icon-tile bg-(--pub-danger-soft)! text-(--pub-danger)!"
        aria-hidden="true"
      >
        <LuCloudOff size={24} />
      </span>
      <p className="flex-1 font-medium">Không tải được {what}. Vui lòng thử lại.</p>
      <button type="button" onClick={onRetry} className="pub-btn pub-btn--ghost">
        <LuRotateCw size={18} aria-hidden="true" />
        Thử lại
      </button>
    </div>
  )
}
