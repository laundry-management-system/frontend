import { ColorSwatch, Group, RingProgress, Stack, Text } from '@mantine/core'
import { LuChartPie } from 'react-icons/lu'
import { EmptyState } from '@/shared/admin/ui'
import { compactMoney } from '../domain/dashboard'
import { pieSlices } from '../domain/report'
import type { ServiceRow } from '../domain/types'

const COLORS = [
  'var(--tone-primary-solid)',
  'var(--tone-info-solid)',
  'var(--tone-vip-solid)',
  'var(--tone-warning-solid)',
  'var(--tone-express-solid)',
  'var(--tone-success-solid)',
  'var(--tone-danger-solid)',
]
const OTHER_COLOR = 'var(--tone-neutral-solid)'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const pct = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

interface ServiceShareRingProps {
  rows: ServiceRow[]
}

export function ServiceShareRing({ rows }: ServiceShareRingProps) {
  const slices = pieSlices(rows).map((s, i) => ({
    ...s,
    label: `${s.name}: ${pct.format(s.pct)}%`,
    color: s.name === 'Khác' ? OTHER_COLOR : COLORS[i % COLORS.length],
  }))
  if (slices.length === 0)
    return (
      <EmptyState
        icon={<LuChartPie size={32} />}
        title="Chưa có doanh thu dịch vụ"
        description="Tỉ trọng doanh thu theo dịch vụ sẽ hiện ở đây."
      />
    )

  const sections = slices.map((s) => ({ value: s.pct, color: s.color, tooltip: s.label }))

  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const centerLabel = (
    <Stack gap={0} align="center">
      <Text size="xs" c="dimmed">
        Doanh thu
      </Text>
      <Text fw={600} size="lg" style={TABULAR}>
        {compactMoney(total)}
      </Text>
    </Stack>
  )

  // Xếp dọc: vòng ở giữa, chú thích bên dưới canh hai đầu để tên dài không đẩy lệch bố cục
  return (
    <Stack gap="lg" justify="center" style={{ flex: 1 }}>
      <RingProgress
        size={176}
        thickness={20}
        roundCaps={false}
        sections={sections}
        label={centerLabel}
        style={{ alignSelf: 'center' }}
      />
      <Stack gap="xs">
        {slices.map((s) => (
          <Group key={s.name} justify="space-between" gap="sm" wrap="nowrap">
            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
              <ColorSwatch color={s.color} size={10} withShadow={false} style={{ flexShrink: 0 }} />
              <Text size="sm" truncate title={s.name}>
                {s.name}
              </Text>
            </Group>
            <Text size="sm" fw={500} style={TABULAR}>
              {pct.format(s.pct)}%
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}
