import { LuTicket } from 'react-icons/lu'

/** Nhãn mã voucher dạng vé: viền đứt, tông accent. */
export function VoucherChip({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-(--pub-radius-md) border border-dashed border-(--pub-accent-ink) bg-(--pub-accent-soft) px-2 py-0.5 font-(family-name:--pub-font-mono) text-(length:--pub-text-sm) font-semibold tracking-wide text-(--pub-accent-ink) uppercase">
      <LuTicket size={14} aria-hidden="true" />
      {code}
    </span>
  )
}
