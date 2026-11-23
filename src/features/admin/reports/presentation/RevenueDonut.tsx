import { ColorSwatch, Group, RingProgress, Stack, Text } from '@mantine/core'
import { LuChartPie } from 'react-icons/lu'
import { formatNumber } from '@/shared/common/lib/format'
import { EmptyState, Money } from '@/shared/admin/ui'

export interface DonutSlice {
  key: string
  label: string
  color: string
  amount: number
  count: number
}

const pctOf = (a: number, sum: number) => Math.round((a * 1000) / sum) / 10

/** Biểu đồ tròn cơ cấu doanh thu + chú giải (nhãn, số tiền, số giao dịch, %). Tự vẽ bằng SVG như RevenueBars. */
export function RevenueDonut({ slices, emptyText }: { slices: DonutSlice[]; emptyText: string }) {
  const sum = slices.reduce((s, x) => s + x.amount, 0)
  if (sum <= 0)
    return (
      <EmptyState
        icon={<LuChartPie size={32} />}
        title="Chưa có doanh thu"
        description={emptyText}
      />
    )
  const pct = (a: number) => pctOf(a, sum)
  const sections = slices.map((s) => ({
    value: pct(s.amount),
    color: s.color,
    tooltip: `${s.label}: ${pct(s.amount)}%`,
  }))
  const center = (
    <Stack gap={0} align="center">
      <Text size="xs" c="dimmed">
        Tổng
      </Text>
      <Text fw={700} size="sm" component="div">
        <Money value={sum} />
      </Text>
    </Stack>
  )
  return (
    <Stack gap="md" align="center">
      <RingProgress
        size={176}
        thickness={20}
        roundCaps={false}
        sections={sections}
        label={center}
      />
      <Stack gap="xs" w="100%">
        {slices.map((s) => (
          <Group key={s.key} justify="space-between" wrap="nowrap" align="flex-start" gap="xs">
            <Group gap={8} wrap="nowrap" align="flex-start">
              <ColorSwatch color={s.color} size={12} withShadow={false} mt={5} />
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {s.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {`${formatNumber(s.count)} giao dịch · ${pct(s.amount)}%`}
                </Text>
              </Stack>
            </Group>
            <Text size="sm" fw={600} component="div">
              <Money value={s.amount} />
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}
