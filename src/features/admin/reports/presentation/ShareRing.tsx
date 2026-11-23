import { RingProgress, Stack, Text } from '@mantine/core'
import { formatOneDecimal } from '@/shared/common/lib/format'
import { LegendRow } from './LegendRow'

const COLORS = [
  'var(--tone-primary-solid)',
  'var(--tone-info-solid)',
  'var(--tone-vip-solid)',
  'var(--tone-warning-solid)',
  'var(--tone-express-solid)',
  'var(--tone-success-solid)',
  'var(--tone-danger-solid)',
]
export const OTHER_COLOR = 'var(--tone-neutral-solid)'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

export interface ShareItem {
  key: string | number
  label: string
  /** Giá trị dùng để chia tỉ lệ; mục có value <= 0 không vẽ */
  value: number
  /** Chữ hiện trước tỉ lệ ở chú thích, vd "12 đơn" */
  detail?: string
  color?: string
}

interface ShareRingProps {
  items: ShareItem[]
  centerLabel: string
  centerValue: string
  size?: number
  thickness?: number
}

/** Vòng tỉ trọng + chú thích xếp dọc bên dưới, dùng chung cho các thẻ phân bổ. */
export function ShareRing({
  items,
  centerLabel,
  centerValue,
  size = 176,
  thickness = 20,
}: ShareRingProps) {
  const rows = items.filter((i) => i.value > 0)
  const total = rows.reduce((s, i) => s + i.value, 0)
  const share = (i: ShareItem) => (total > 0 ? (i.value * 100) / total : 0)
  const colored = rows.map((i, idx) => ({ ...i, color: i.color ?? COLORS[idx % COLORS.length] }))

  return (
    <Stack gap="lg" justify="center" style={{ flex: 1 }}>
      <RingProgress
        size={size}
        thickness={thickness}
        roundCaps={false}
        sections={colored.map((i) => ({
          value: share(i),
          color: i.color,
          tooltip: `${i.label}: ${formatOneDecimal(share(i))}%`,
        }))}
        label={
          <Stack gap={0} align="center">
            <Text size="xs" c="dimmed">
              {centerLabel}
            </Text>
            <Text fw={600} size="lg" style={TABULAR}>
              {centerValue}
            </Text>
          </Stack>
        }
        style={{ alignSelf: 'center' }}
      />
      <Stack gap="xs">
        {colored.map((i) => (
          <LegendRow
            key={i.key}
            color={i.color}
            label={i.label}
            value={[i.detail, `${formatOneDecimal(share(i))}%`].filter(Boolean).join(' · ')}
          />
        ))}
      </Stack>
    </Stack>
  )
}
