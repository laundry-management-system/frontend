import { Badge, Button, Card, Checkbox, Group, Stack, Text, Title } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { OPENING_HOURS } from '@/shared/config/constants'
import { formatMoney } from '@/shared/lib/format'
import { type DueKey, PLANNED_ORDER_LABEL, type PlannedOrder } from '../../domain/intake'
import { quickDueOptions, type QuickDueOption } from '../../domain/dueDate'

interface PlannedOrderCardProps {
  plan: PlannedOrder
  dueKey: DueKey
  now: Date
  /** Phụ phí đồ trắng hiện hành (tham khảo, chốt lúc phân loại) */
  whitesFee: number | undefined
  error?: string
  onDueChange: (value: Date | null) => void
  onQuickDue: (option: QuickDueOption) => void
  onWhitesChange: (checked: boolean) => void
}

/** Một đơn trong khu "Đơn sẽ tạo": dịch vụ tham khảo, ngày hẹn riêng, giặt riêng đồ trắng. */
export function PlannedOrderCard({
  plan,
  dueKey,
  now,
  whitesFee,
  error,
  onDueChange,
  onQuickDue,
  onWhitesChange,
}: PlannedOrderCardProps) {
  const express = plan.orderType === 'EXPRESS'
  const options = quickDueOptions(plan.orderType, plan.hours, now, OPENING_HOURS)
  const handleDateChange = (v: string | null) => onDueChange(v ? dayjs(v).toDate() : null)
  const toggleWhites = () => onWhitesChange(!plan.whites)

  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      style={{ borderColor: express ? 'var(--tone-warning-border)' : undefined }}
    >
      <Stack gap="sm">
        <Group gap="xs">
          <Title order={5}>{PLANNED_ORDER_LABEL[plan.orderType]}</Title>
          <Badge color={express ? 'warning' : 'teal'} variant="light">
            {express ? 'Ưu tiên' : 'Tiêu chuẩn'}
          </Badge>
        </Group>
        <Group gap={6}>
          {plan.services.map((s) => (
            <Badge key={s.id} color="gray" variant="light" radius="sm" tt="none">
              {s.name}
            </Badge>
          ))}
        </Group>
        <DateTimePicker
          label="Ngày hẹn trả"
          required
          valueFormat="DD/MM/YYYY · HH:mm"
          minDate={now}
          value={plan.dueAt}
          onChange={handleDateChange}
          error={error}
        />
        <Group gap="xs">
          {options.map((o) => (
            <Button
              key={o.key}
              size="xs"
              variant={dueKey === o.key ? 'filled' : 'secondary'}
              onClick={() => onQuickDue(o)}
            >
              {o.label}
            </Button>
          ))}
        </Group>
        {plan.whitesAvailable && (
          <Checkbox.Card checked={plan.whites} onClick={toggleWhites} radius="md" p="sm">
            <Group wrap="nowrap" gap="sm">
              <Checkbox.Indicator />
              <Stack gap={0} style={{ flex: 1 }}>
                <Text fw={600}>Giặt riêng đồ trắng</Text>
                <Text size="sm" c="dimmed">
                  Wash whites separately
                </Text>
              </Stack>
              <Text size="sm" fw={600}>
                {whitesFee == null ? '' : `+${formatMoney(whitesFee)}`}
              </Text>
            </Group>
          </Checkbox.Card>
        )}
      </Stack>
    </Card>
  )
}
