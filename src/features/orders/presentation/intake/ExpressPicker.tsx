import { Checkbox, Group, Stack, Text } from '@mantine/core'
import { type Service, UNIT_LABEL } from '@/features/services'
import { formatMoney } from '@/shared/lib/format'

interface ExpressPickerProps {
  services: Service[]
  enabled: boolean
  expressIds: number[]
  onToggleEnabled: () => void
  onToggleService: (id: number) => void
}

/** Bước 3: tick Giặt nhanh rồi chọn dịch vụ đi đơn giặt nhanh (chỉ dịch vụ có hỗ trợ). */
export function ExpressPicker({
  services,
  enabled,
  expressIds,
  onToggleEnabled,
  onToggleService,
}: ExpressPickerProps) {
  const capable = services.filter((s) => s.expressSupported)
  return (
    <Stack gap="sm">
      <Checkbox.Card
        checked={enabled}
        onClick={onToggleEnabled}
        radius="lg"
        p="md"
        bg={enabled ? 'var(--tone-warning-bg)' : undefined}
        style={{ borderColor: enabled ? 'var(--tone-warning-border)' : undefined }}
      >
        <Group wrap="nowrap" align="flex-start" gap="md">
          <Checkbox.Indicator mt={2} color="yellow" />
          <Stack gap={0}>
            <Text fw={700} tt="uppercase">
              Giặt nhanh
            </Text>
            <Text size="sm" c="dimmed">
              Phần chọn giặt nhanh được tách thành đơn riêng
            </Text>
          </Stack>
        </Group>
      </Checkbox.Card>
      {enabled && (
        <Stack gap={4} pl="md" style={{ borderLeft: '3px solid var(--tone-warning-border)' }}>
          <Text size="sm" c="dimmed">
            {capable.length
              ? 'Dịch vụ đã chọn có hỗ trợ giặt nhanh – chọn phần khách muốn lấy sớm:'
              : services.length
                ? 'Các dịch vụ đã chọn không hỗ trợ giặt nhanh.'
                : 'Chọn dịch vụ ở bước 2 trước.'}
          </Text>
          {capable.map((s) => {
            const checked = expressIds.includes(s.id)
            const toggle = () => onToggleService(s.id)
            const unit = s.unit ? UNIT_LABEL[s.unit] : 'đơn vị'
            return (
              <Checkbox.Card
                key={s.id}
                checked={checked}
                onClick={toggle}
                withBorder={false}
                radius="md"
                px="sm"
                py={8}
                bg={checked ? 'var(--tone-warning-bg)' : undefined}
              >
                <Group wrap="nowrap" gap="sm">
                  <Checkbox.Indicator color="yellow" />
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={600}>{s.name}</Text>
                    <Text size="sm" c="dimmed">
                      {`Tiêu chuẩn ${s.standardHours} giờ → giặt nhanh ${s.expressHours} giờ`}
                    </Text>
                  </Stack>
                  <Text
                    size="sm"
                    fw={600}
                    c="var(--tone-warning-fg)"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {`+${formatMoney(s.expressSurcharge ?? 0)}/${unit}`}
                  </Text>
                </Group>
              </Checkbox.Card>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
