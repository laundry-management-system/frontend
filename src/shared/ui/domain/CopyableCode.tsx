import { CopyButton, Tooltip, UnstyledButton } from '@mantine/core'
import { LuCheck, LuCopy } from 'react-icons/lu'
import { EntityCode, type EntityCodeSize } from './EntityCode'

/** Mã định danh kèm nút sao chép – dùng cho cột mã trong bảng listing. */
export function CopyableCode({ code, size = 'md' }: { code: string; size?: EntityCodeSize }) {
  const big = size === 'display'
  const icon = big ? 22 : 16
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 10 : 6,
        padding: big ? '8px 12px 8px 20px' : '3px 6px 3px 10px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--ds-accent)',
        color: 'var(--ds-accent-foreground)',
        whiteSpace: 'nowrap',
      }}
    >
      <EntityCode code={code} size={size} />
      <CopyButton value={code} timeout={1500}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Đã chép' : 'Sao chép'}>
            <UnstyledButton
              className="ds-focus"
              aria-label={`Sao chép mã ${code}`}
              onClick={(e) => {
                // Dòng bảng bấm được để mở chi tiết: không để click sao chép lan ra dòng
                e.stopPropagation()
                copy()
              }}
              style={{
                display: 'inline-flex',
                padding: 4,
                borderRadius: 'var(--radius-md)',
                color: 'inherit',
              }}
            >
              {copied ? <LuCheck size={icon} /> : <LuCopy size={icon} />}
            </UnstyledButton>
          </Tooltip>
        )}
      </CopyButton>
    </span>
  )
}
