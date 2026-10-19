import { Button, Card, Divider, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuUserCheck, LuUserX } from 'react-icons/lu'
import { StatusBadge } from '@/shared/ui'
import { formatPhone } from '../domain/rules'
import type { Customer } from '../domain/types'
import { CustomerStatusText } from './CustomerCell'

interface CustomerInfoCardProps {
  customer: Customer
  canManage: boolean
  onToggleStatus?: () => void
  statusLoading?: boolean
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <Stack gap={2}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <div>{children}</div>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Stack>
  )
}

export function CustomerInfoCard({
  customer,
  canManage,
  onToggleStatus,
  statusLoading,
}: CustomerInfoCardProps) {
  const active = customer.status === 'ACTIVE'
  return (
    <Card w={400} style={{ flexShrink: 0 }}>
      <Stack>
        <Title order={4}>Thông tin</Title>
        <Field label="Họ và tên">{customer.fullName}</Field>
        <Field label="Số điện thoại">{formatPhone(customer.phone)}</Field>
        <Field label="Địa chỉ">{customer.address || '—'}</Field>
        <Field label="Ghi chú">
          <Text style={{ whiteSpace: 'pre-wrap' }}>{customer.note || '—'}</Text>
        </Field>
        <Field label="Nhãn VIP">
          {customer.isVip ? <StatusBadge group="flag" statusKey="vip" size="sm" /> : 'Không'}
        </Field>
        <Field label="Trạng thái">
          <CustomerStatusText status={customer.status} />
        </Field>
        {canManage && (
          <>
            <Divider />
            {/* Thao tác tách khỏi vùng thông tin: nút viền rõ ràng, đỏ khi là thao tác hủy */}
            <Stack gap={6}>
              <Button
                fullWidth
                variant="outline"
                color={active ? 'danger' : 'primary'}
                leftSection={active ? <LuUserX size={16} /> : <LuUserCheck size={16} />}
                loading={statusLoading}
                onClick={onToggleStatus}
              >
                {active ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  )
}
