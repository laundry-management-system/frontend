import { Badge, Checkbox, Group, Stack, Text } from '@mantine/core'
import { type Service, UNIT_LABEL } from '@/features/services'
import { formatMoney } from '@/shared/lib/format'
import type { validateLine } from '../../domain/rules'
import type { OrderLine, OrderType } from '../../domain/types'
import { ItemLineEditor } from './ItemLineEditor'

interface ClassifyServiceListProps {
  services: Service[]
  /** Dịch vụ khách chọn lúc tiếp nhận (ghi chú tham khảo của đơn) */
  requestedIds: number[]
  orderType: OrderType
  lines: OrderLine[]
  /** Thành tiền từng dòng, cùng thứ tự `lines` */
  perLine: number[]
  /** Lỗi từng dòng, cùng thứ tự `lines` */
  errors: ReturnType<typeof validateLine>[]
  onToggle: (service: Service) => void
  onChange: (serviceId: number, patch: Partial<OrderLine>) => void
}

const LIST_BOX = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--radius-card)',
  overflow: 'hidden',
} as const

/**
 * Dòng đồ của đơn tiếp nhận v3 dạng checklist dịch vụ: dịch vụ khách chọn lúc nhận được tick sẵn,
 * tick thêm / bỏ tick để sửa. Mỗi dịch vụ tối đa một dòng; đơn giặt nhanh chỉ có dịch vụ hỗ trợ nhanh.
 */
export function ClassifyServiceList({
  services,
  requestedIds,
  orderType,
  lines,
  perLine,
  errors,
  onToggle,
  onChange,
}: ClassifyServiceListProps) {
  const visible = services
    .filter((s) => orderType !== 'EXPRESS' || s.expressSupported)
    // Dịch vụ khách chọn lúc nhận lên đầu, còn lại giữ thứ tự bảng giá
    .sort((a, b) => Number(requestedIds.includes(b.id)) - Number(requestedIds.includes(a.id)))

  return (
    <Stack gap={0} style={LIST_BOX}>
      {visible.map((s, i) => {
        const index = lines.findIndex((l) => l.serviceId === s.id)
        const line = lines[index]
        const unit = s.unit ? UNIT_LABEL[s.unit] : 'đơn vị'
        const toggle = () => onToggle(s)
        const change = (patch: Partial<OrderLine>) => onChange(s.id, patch)
        return (
          <Stack
            key={s.id}
            gap={0}
            bg={line ? 'var(--ds-accent)' : undefined}
            style={{ borderTop: i ? '1px solid var(--ds-border)' : undefined }}
          >
            <Checkbox.Card
              checked={!!line}
              onClick={toggle}
              withBorder={false}
              radius={0}
              px="md"
              py="sm"
              bg="transparent"
            >
              <Group wrap="nowrap" gap="md">
                <Checkbox.Indicator />
                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600}>{s.name}</Text>
                  <Text size="sm" c="dimmed">
                    {`${formatMoney(s.price)}/${unit}`}
                    {s.minQuantity > 0 && ` · tối thiểu ${s.minQuantity} ${unit}`}
                  </Text>
                </Stack>
                {requestedIds.includes(s.id) && (
                  <Badge color="teal" variant="light">
                    Khách chọn lúc nhận
                  </Badge>
                )}
              </Group>
            </Checkbox.Card>
            {line && (
              <Stack px="md" pb="md" pl={52}>
                <ItemLineEditor
                  index={index}
                  line={line}
                  services={services}
                  orderType={orderType}
                  lineTotal={perLine[index]}
                  errors={errors[index]}
                  byService
                  embedded
                  onChange={change}
                />
              </Stack>
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}
