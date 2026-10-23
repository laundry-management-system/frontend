import { Button, Card, Stack, Title, Tooltip } from '@mantine/core'
import { InfoLabel } from '@/shared/ui'
import { adminActionsOf } from '../../domain/rules'
import type { OrderStatus } from '../../domain/types'

export type AdminAction = 'reschedule' | 'price' | 'revert' | 'cancel'

const ACTIONS: { key: AdminAction; label: string; danger?: boolean }[] = [
  { key: 'reschedule', label: 'Sửa ngày hẹn trả' },
  { key: 'price', label: 'Sửa đơn giá / tổng tiền' },
  { key: 'revert', label: 'Lùi trạng thái' },
  { key: 'cancel', label: 'Hủy đơn', danger: true },
]

/** Chỉ render cho Admin (BR-A04); BE chưa chặn vai trò (handoff 008 #9). */
export function AdminActionsCard({
  status,
  onAction,
}: {
  status: OrderStatus
  onAction: (action: AdminAction) => void
}) {
  const available = adminActionsOf({ status })
  return (
    <Card>
      <Stack gap="xs">
        <Title order={5}>
          <InfoLabel info="Chỉ Admin thấy · mọi thao tác yêu cầu lý do và được ghi vào lịch sử đơn">
            Thao tác Admin
          </InfoLabel>
        </Title>
        {ACTIONS.map(({ key, label, danger }) => {
          const a = available[key]
          return (
            <Tooltip key={key} label={a.reason} disabled={a.enabled}>
              <Button
                fullWidth
                size="sm"
                variant={danger ? 'filled' : 'secondary'}
                color={danger ? 'danger' : undefined}
                data-disabled={!a.enabled || undefined}
                onClick={(e) => (a.enabled ? onAction(key) : e.preventDefault())}
              >
                {label}
              </Button>
            </Tooltip>
          )
        })}
      </Stack>
    </Card>
  )
}
