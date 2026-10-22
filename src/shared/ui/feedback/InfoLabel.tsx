import { Group } from '@mantine/core'
import type { ReactNode } from 'react'
import { InfoTooltip } from './InfoTooltip'

interface InfoLabelProps {
  children: ReactNode
  /** Giải thích hiện trong tooltip; không có thì chỉ render nhãn */
  info?: ReactNode
}

/** Nhãn kèm icon (i) – dùng cho `label` của input hoặc tiêu đề nhỏ, không làm cao dòng chữ. */
export function InfoLabel({ children, info }: InfoLabelProps) {
  if (!info) return <>{children}</>
  return (
    <Group component="span" gap={4} wrap="nowrap" display="inline-flex">
      {children}
      <InfoTooltip size="xs" content={info} />
    </Group>
  )
}
