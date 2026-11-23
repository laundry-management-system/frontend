import { useState } from 'react'
import { LuCheck, LuCopy } from 'react-icons/lu'

export function TransferContent({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="grid justify-items-center gap-1">
      <span className="text-(--pub-ink-muted)">Nội dung chuyển khoản</span>
      <div className="flex items-center gap-1">
        <span className="font-(family-name:--pub-font-mono) font-semibold">{text}</span>
        <span role="status" className="text-(length:--pub-text-sm) text-(--pub-accent-ink)">
          {copied ? 'Đã sao chép' : ''}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Sao chép nội dung chuyển khoản"
          className="grid size-11 cursor-pointer place-items-center rounded-full text-(--pub-ink) hover:bg-white/70"
        >
          {copied ? (
            <LuCheck size={18} aria-hidden="true" />
          ) : (
            <LuCopy size={18} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
