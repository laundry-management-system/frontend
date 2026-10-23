import { Badge, Checkbox, Group, Stack, Text } from '@mantine/core'
import { type Service, UNIT_LABEL } from '@/features/services'
import { formatMoney } from '@/shared/lib/format'

interface ServicePickerProps {
  services: Service[]
  selectedIds: number[]
  /** Dịch vụ đang đi đơn giặt nhanh */
  expressIds: number[]
  onToggle: (id: number) => void
}

const unitOf = (s: Service) => (s.unit ? UNIT_LABEL[s.unit] : 'đơn vị')

function ExpressTag({ service, goesExpress }: { service: Service; goesExpress: boolean }) {
  if (goesExpress)
    return (
      <Badge color="warning" variant="filled">
        Đi đơn giặt nhanh
      </Badge>
    )
  if (service.expressSupported)
    return (
      <Badge color="warning" variant="light">
        {`Có giặt nhanh · ${service.expressHours} giờ`}
      </Badge>
    )
  return (
    <Badge color="gray" variant="outline">
      Không giặt nhanh
    </Badge>
  )
}

/** Bước 2: chạm chọn nhóm dịch vụ khách mang đến (chỉ để tham khảo & tách đơn, chưa có giá). */
export function ServicePicker({ services, selectedIds, expressIds, onToggle }: ServicePickerProps) {
  return (
    <Stack
      gap={0}
      style={{
        border: '1px solid var(--ds-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      {services.map((s, i) => {
        const checked = selectedIds.includes(s.id)
        const toggle = () => onToggle(s.id)
        return (
          <Checkbox.Card
            key={s.id}
            checked={checked}
            onClick={toggle}
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
                  {`${formatMoney(s.price)}/${unitOf(s)}`}
                  {s.minQuantity > 0 && ` · tối thiểu ${s.minQuantity} ${unitOf(s)}`}
                  {` · xong trong ${s.standardHours} giờ`}
                </Text>
              </Stack>
              <ExpressTag service={s} goesExpress={expressIds.includes(s.id)} />
            </Group>
          </Checkbox.Card>
        )
      })}
    </Stack>
  )
}
