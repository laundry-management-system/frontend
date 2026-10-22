import { ActionIcon, Tooltip } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuInfo } from 'react-icons/lu'

interface InfoTooltipProps {
  /** Nội dung giải thích hiện khi hover / focus / chạm */
  content: ReactNode
  /** aria-label cho icon */
  label?: string
  /** `xs`: đặt trong label của input mà không làm cao dòng label */
  size?: 'sm' | 'xs'
}

/** Icon "i" kèm tooltip: ghi chú phụ, không chiếm chỗ trên trang. */
export function InfoTooltip({ content, label = 'Thông tin thêm', size = 'sm' }: InfoTooltipProps) {
  return (
    <Tooltip label={content} multiline w={300} events={{ hover: true, focus: true, touch: true }}>
      <ActionIcon
        variant="subtle"
        color="neutral"
        size={size}
        aria-label={label}
        // xs: bù margin âm để icon không đẩy chiều cao dòng chữ
        my={size === 'xs' ? -4 : undefined}
      >
        <LuInfo size={size === 'xs' ? 14 : 18} />
      </ActionIcon>
    </Tooltip>
  )
}
