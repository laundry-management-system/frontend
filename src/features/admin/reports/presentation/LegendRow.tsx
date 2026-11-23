import { ColorSwatch, Group, Text } from '@mantine/core'

interface LegendRowProps {
  color: string
  label: string
  value: string
}

/** Một dòng chú thích biểu đồ vòng: chấm màu + tên bên trái, số liệu bên phải. */
export function LegendRow({ color, label, value }: LegendRowProps) {
  return (
    <Group justify="space-between" gap="sm" wrap="nowrap">
      <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
        <ColorSwatch color={color} size={10} withShadow={false} style={{ flexShrink: 0 }} />
        <Text size="sm" truncate title={label}>
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Group>
  )
}
