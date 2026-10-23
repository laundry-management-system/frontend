import { Badge, Button, Card, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { LuCircleCheck, LuPrinter } from 'react-icons/lu'
import { formatPhone } from '@/features/customers'
import { formatDateTime } from '@/shared/lib/format'
import { CopyableCode, EntityCode } from '@/shared/ui'
import { PLANNED_ORDER_LABEL } from '../../domain/intake'
import type { OrderType } from '../../domain/types'

export interface CreatedOrder {
  id: number
  orderCode: string
  orderType: OrderType
  dueAt: string
  washWhitesSeparately: boolean
}

interface OrderCreatedCardProps {
  customerName: string
  customerPhone: string
  /** null với đơn tạo trước tiếp nhận v3 */
  intakeCode: string | null
  orders: CreatedOrder[]
  onNext: () => void
  onPrintAll: () => void
  onClassify: (orderId: number) => void
  printing?: boolean
}

export function OrderCreatedCard({
  customerName,
  customerPhone,
  intakeCode,
  orders,
  onNext,
  onPrintAll,
  onClassify,
  printing,
}: OrderCreatedCardProps) {
  const many = orders.length > 1
  return (
    <Card py="xl" maw={640} mx="auto">
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" color="success" variant="light">
          <LuCircleCheck size={32} />
        </ThemeIcon>
        <Title order={3}>
          {many ? `Đã tạo ${orders.length} đơn & gửi lệnh in` : 'Đã tạo đơn & gửi lệnh in'}
        </Title>
        <Text c="dimmed" ta="center">
          {customerName} · {formatPhone(customerPhone)}
          {intakeCode && (
            <>
              {' · lượt '}
              <EntityCode code={intakeCode} size="sm" />
            </>
          )}
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Các đơn ở trạng thái Mới nhận, chờ phân loại và cân.
        </Text>
        <Stack gap="sm" w="100%">
          {orders.map((o) => (
            <Group
              key={o.id}
              justify="space-between"
              wrap="nowrap"
              p="md"
              style={{
                border: '1px solid var(--ds-border)',
                borderRadius: 'var(--radius-control)',
              }}
            >
              <Stack gap={4} align="flex-start">
                <CopyableCode code={o.orderCode} size={many ? 'md' : 'display'} />
                <Group gap={6}>
                  <Badge color={o.orderType === 'EXPRESS' ? 'warning' : 'teal'} variant="light">
                    {PLANNED_ORDER_LABEL[o.orderType]}
                  </Badge>
                  {o.washWhitesSeparately && (
                    <Badge color="gray" variant="light">
                      Đồ trắng
                    </Badge>
                  )}
                  <Text size="sm" c="dimmed">
                    {`Hẹn ${formatDateTime(o.dueAt).slice(0, 16)}`}
                  </Text>
                </Group>
              </Stack>
              <Button variant="secondary" onClick={() => onClassify(o.id)}>
                Phân loại ngay
              </Button>
            </Group>
          ))}
        </Stack>
        <Group gap="sm">
          <Button size="lg" onClick={onNext}>
            Nhận khách tiếp theo
          </Button>
          <Button
            size="lg"
            variant="secondary"
            leftSection={<LuPrinter size={18} />}
            loading={printing}
            onClick={onPrintAll}
          >
            {many ? 'In lại tất cả phiếu' : 'In lại phiếu'}
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
