import { SimpleGrid, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'

export type MachineFact = [label: string, value: ReactNode, wide?: boolean]

interface MachineFactsProps {
  facts: MachineFact[]
}

const WIDE = { gridColumn: 'span 2' } as const
const WRAP = { overflowWrap: 'anywhere' } as const

/** Lưới nhãn – giá trị 2 cột; dòng không có giá trị bị bỏ, không hiện ký tự thay thế. */
export function MachineFacts({ facts }: MachineFactsProps) {
  const rows = facts.filter(([, value]) => value)
  if (!rows.length) return null
  return (
    <SimpleGrid cols={2} spacing="xs" verticalSpacing={6}>
      {rows.map(([label, value, wide]) => (
        <Stack key={label} gap={0} style={wide ? WIDE : undefined}>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text size="sm" component="div" style={WRAP}>
            {value}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  )
}
