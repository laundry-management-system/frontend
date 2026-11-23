import { Badge, Button, Card, Checkbox, Group, Stack, Text, Title } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import { OPENING_HOURS } from '@/shared/admin/config/constants'
import { formatMoney } from '@/shared/common/lib/format'
import type { Service, WashMode } from '@/features/admin/services'
import type { DueKey } from '../../domain/intake'
import { quickDueOptions, type QuickDueOption } from '../../domain/dueDate'

interface PlannedOrderCardProps {
  mode: WashMode
  services: Service[]
  dueAt: Date | null
  whitesAvailable: boolean
  whites: boolean
  dueKey: DueKey
  now: Date
  /** Phụ phí đồ trắng hiện hành (tham khảo, chốt lúc phân loại) */
  whitesFee: number | undefined
  error?: string
  onDueChange: (value: Date | null) => void
  onQuickDue: (option: QuickDueOption) => void
  onWhitesChange: (checked: boolean) => void
}

/** Đơn sẽ tạo của lượt nhận: hình thức, dịch vụ, ngày hẹn trả (mặc định = gợi ý), giặt riêng đồ trắng. */
export function PlannedOrderCard({
  mode,
  services,
  dueAt,
  whitesAvailable,
  whites,
  dueKey,
  now,
  whitesFee,
  error,
  onDueChange,
  onQuickDue,
  onWhitesChange,
}: PlannedOrderCardProps) {
  const options = quickDueOptions(mode.completionHours, now, OPENING_HOURS)
  const handleDateChange = (v: string | null) => onDueChange(v ? dayjs(v).toDate() : null)
  const toggleWhites = () => onWhitesChange(!whites)

  return (
    <Card withBorder radius="lg" p="md">
      <Stack gap="sm">
        <Group gap="xs">
          <Title order={5}>Đơn giặt</Title>
          <Badge color="teal" variant="light">
            {mode.name}
          </Badge>
        </Group>
        <Group gap={6}>
          {services.map((s) => (
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
          value={dueAt}
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
        {whitesAvailable && (
          <Checkbox.Card checked={whites} onClick={toggleWhites} radius="md" p="sm">
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
