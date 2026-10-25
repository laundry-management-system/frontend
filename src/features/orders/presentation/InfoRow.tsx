import { Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

/** Dòng nhãn – giá trị dùng chung cho các thẻ ở cột phải trang chi tiết đơn. */
export function InfoRow({
  label,
  children,
  strong,
}: {
  label: string
  children: ReactNode
  strong?: boolean
}) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
      <Text size="sm" c={strong ? undefined : 'dimmed'}>
        {label}
      </Text>
      <Text
        size={strong ? 'md' : 'sm'}
        fw={strong ? 700 : 500}
        ta="right"
        style={TABULAR}
        component="div"
      >
        {children}
      </Text>
    </Group>
  )
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={8}>
      <Text className="text-overline" c="dimmed">
        {title}
      </Text>
      {children}
    </Stack>
  )
}
