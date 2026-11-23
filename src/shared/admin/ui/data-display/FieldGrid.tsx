import { SimpleGrid, Text } from '@mantine/core'
import type { ReactNode } from 'react'

export type FieldRow = [label: string, value: ReactNode]

/** Danh sách nhãn/giá trị chỉ đọc: nhãn mờ rộng cố định bên trái, 2 cột từ lg; dòng không có giá trị thì bỏ. */
export function FieldGrid({ rows }: { rows: [string, ReactNode | false | null | undefined][] }) {
  const shown = rows.filter((r): r is FieldRow => !!r[1])
  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xs" verticalSpacing="xs">
      {shown.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: 'grid',
            gridTemplateColumns: '112px 1fr',
            gap: 'var(--mantine-spacing-xs)',
          }}
        >
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Text size="sm" component="div">
            {value}
          </Text>
        </div>
      ))}
    </SimpleGrid>
  )
}
