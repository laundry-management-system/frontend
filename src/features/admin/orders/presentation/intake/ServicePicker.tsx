import { Checkbox, Group, Stack, Text } from '@mantine/core'
import { isBookable, priceFor, type Service, UNIT_LABEL } from '@/features/admin/services'
import { formatMoney } from '@/shared/common/lib/format'

interface ServicePickerProps {
  services: Service[]
  selectedIds: number[]
  washModeId: number
  /** Hình thức mặc định: dịch vụ chưa có giá ở đây không đặt được (FR-001a) */
  defaultModeId: number | null
  completionHours: number
  onToggle: (id: number) => void
}

const unitOf = (s: Service) => (s.unit ? UNIT_LABEL[s.unit] : 'đơn vị')

/** Bước 3: chạm chọn dịch vụ khách mang đến; ẩn dịch vụ không đặt được hoặc chưa có giá cho hình thức đã chọn. */
export function ServicePicker({
  services,
  selectedIds,
  washModeId,
  defaultModeId,
  completionHours,
  onToggle,
}: ServicePickerProps) {
  const visible = services.filter(
    (s) => isBookable(s, defaultModeId) && priceFor(s, washModeId) != null,
  )
  if (!visible.length)
    return (
      <Text size="sm" c="dimmed">
        Chưa có dịch vụ nào cho hình thức này – chọn hình thức khác hoặc liên hệ quản lý.
      </Text>
    )
  return (
    <Stack
      gap={0}
      style={{
        border: '1px solid var(--ds-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      {visible.map((s, i) => {
        const checked = selectedIds.includes(s.id)
        return (
          <Checkbox.Card
            key={s.id}
            checked={checked}
            onClick={() => onToggle(s.id)}
            radius={0}
            px="md"
            py="sm"
            withBorder={false}
            bg={checked ? 'var(--ds-accent)' : undefined}
            style={{ borderTop: i ? '1px solid var(--ds-border)' : undefined }}
          >
            <Group wrap="nowrap" align="flex-start" gap="md">
              <Checkbox.Indicator mt={2} />
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600}>{s.name}</Text>
                <Text size="sm" c="dimmed">
                  {`${formatMoney(priceFor(s, washModeId) ?? 0)}/${unitOf(s)}`}
                  {s.minQuantity > 0 && ` · tối thiểu ${s.minQuantity} ${unitOf(s)}`}
                  {` · xong trong ${completionHours} giờ`}
                </Text>
              </Stack>
            </Group>
          </Checkbox.Card>
        )
      })}
    </Stack>
  )
}
