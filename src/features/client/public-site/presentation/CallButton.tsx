import { formatPhone } from '@/shared/common/lib/format'
import { CopyButton, Popover } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { LuCheck, LuCopy, LuPhone } from 'react-icons/lu'

interface CallButtonProps {
  phone: string | null
  size?: 'md' | 'lg'
  fullWidth?: boolean
}

// Trình duyệt không cho biết máy có gọi được không; có chuột thì coi là máy tính
const DESKTOP_QUERY = '(hover: hover) and (pointer: fine)'
const MEDIA_OPTIONS = { getInitialValueInEffect: false }

/** Nút "Gọi cho tiệm": điện thoại mở cuộc gọi, máy tính hiện số kèm nút sao chép. Không có số thì không render. */
export function CallButton({ phone, size = 'md', fullWidth = false }: CallButtonProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY, false, MEDIA_OPTIONS)
  if (!phone) return null

  const className = `pub-btn pub-btn--accent ${size === 'lg' ? 'pub-btn--lg' : ''} ${fullWidth ? 'w-full' : ''}`
  const label = (
    <>
      <LuPhone size={size === 'lg' ? 20 : 18} aria-hidden="true" />
      Gọi cho tiệm
    </>
  )

  if (!isDesktop) {
    return (
      <a href={`tel:${phone}`} className={className}>
        {label}
      </a>
    )
  }

  return (
    <Popover
      position="bottom"
      withArrow
      shadow="md"
      radius="var(--pub-radius-lg)"
      trapFocus
      returnFocus
      withinPortal={false}
    >
      <Popover.Target>
        <button type="button" className={className}>
          {label}
        </button>
      </Popover.Target>
      <Popover.Dropdown className="min-w-60 border-(--pub-border)! p-4!">
        <p className="text-sm text-(--pub-ink-muted)">Số điện thoại của tiệm</p>
        <p className="my-1 font-(family-name:--pub-font-display) text-2xl font-semibold text-(--pub-ink) select-all">
          {formatPhone(phone)}
        </p>
        <CopyButton value={phone}>
          {({ copied, copy }) => (
            <button type="button" onClick={copy} className="pub-btn pub-btn--ghost mt-2 w-full">
              {copied ? (
                <LuCheck size={18} aria-hidden="true" />
              ) : (
                <LuCopy size={18} aria-hidden="true" />
              )}
              {copied ? 'Đã sao chép' : 'Sao chép số'}
            </button>
          )}
        </CopyButton>
      </Popover.Dropdown>
    </Popover>
  )
}
