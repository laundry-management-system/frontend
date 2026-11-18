import { Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import type { DiffTone } from '@/features/admin/shifts'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const TONE_FG: Record<DiffTone, string> = {
  success: 'var(--tone-success-fg)',
  danger: 'var(--tone-danger-fg)',
  warning: 'var(--tone-warning-fg)',
}
const TONE_BG: Record<DiffTone, string> = {
  success: 'var(--tone-success-bg)',
  danger: 'var(--tone-danger-bg)',
  warning: 'var(--tone-warning-bg)',
}

/** Ô số trong hàng đối chiếu (Dự kiến | Thực đếm | Chênh lệch) */
export function CompareCell({
  label,
  value,
  tone,
}: {
  label: ReactNode
  value: string
  tone?: DiffTone
}) {
  return (
    <Stack
      gap={2}
      p="sm"
      style={{
        borderRadius: 'var(--radius-control)',
        background: tone ? TONE_BG[tone] : 'var(--ds-muted)',
      }}
    >
      <Text size="xs" c="dimmed" component="div">
        {label}
      </Text>
      <Text fw={700} c={tone ? TONE_FG[tone] : undefined} style={TABULAR}>
        {value}
      </Text>
    </Stack>
  )
}
