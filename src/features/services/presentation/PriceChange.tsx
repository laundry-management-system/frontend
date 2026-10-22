import { Badge, Group, Paper, Stack, Text } from '@mantine/core'
import { LuArrowRight, LuMinus, LuTrendingDown, LuTrendingUp } from 'react-icons/lu'
import { formatMoney } from '@/shared/lib/format'
import { InfoLabel } from '@/shared/ui'
import { priceDelta } from '../domain/rules'

const DIRECTION = {
  up: { color: 'warning', icon: LuTrendingUp },
  down: { color: 'success', icon: LuTrendingDown },
  same: { color: 'neutral', icon: LuMinus },
} as const

/** So sánh giá cũ → giá mới trong hộp xác nhận đổi giá. */
export function PriceChange({ oldPrice, newPrice }: { oldPrice: number; newPrice: number }) {
  const delta = priceDelta(oldPrice, newPrice)
  const { color, icon: Icon } = DIRECTION[delta.direction]

  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            Giá cũ
          </Text>
          <Text className="text-money" c="dimmed" td="line-through">
            {formatMoney(oldPrice)}
          </Text>
        </Stack>
        <LuArrowRight size={20} aria-hidden className="mb-1 text-muted-foreground" />
        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" component="div">
            <InfoLabel info="Đơn đã tạo vẫn giữ giá cũ; giá mới chỉ áp cho đơn phân loại sau khi lưu.">
              Giá mới
            </InfoLabel>
          </Text>
          <Text className="text-numeric-display" c="var(--mantine-color-text)">
            {formatMoney(newPrice)}
          </Text>
        </Stack>
      </Group>
      <Group justify="flex-end" mt="xs">
        <Badge color={color} variant="light" leftSection={<Icon size={14} aria-hidden />}>
          {delta.label}
        </Badge>
      </Group>
    </Paper>
  )
}
