import { Group, Progress, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

export interface BarListItem {
  key: string | number
  label: ReactNode
  /** Độ dài thanh tính theo |value| so với giá trị lớn nhất */
  value: number
  display: ReactNode
  color?: string
}

export function BarList({ items }: { items: BarListItem[] }) {
  const max = Math.max(0, ...items.map((i) => Math.abs(i.value)))
  return (
    <Stack gap="sm">
      {items.map((i) => (
        <div key={i.key}>
          <Group justify="space-between" gap="sm" wrap="nowrap">
            <div style={{ minWidth: 0 }}>{i.label}</div>
            <Text size="sm" fw={600} style={TABULAR}>
              {i.display}
            </Text>
          </Group>
          <Progress
            value={max > 0 ? (Math.abs(i.value) * 100) / max : 0}
            color={i.color}
            size={8}
            mt={4}
          />
        </div>
      ))}
    </Stack>
  )
}
