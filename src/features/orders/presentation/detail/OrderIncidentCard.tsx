import { Card, Title } from '@mantine/core'
import { LuTriangleAlert } from 'react-icons/lu'
import { EmptyState } from '@/shared/ui'

/** Chỗ giữ cho WF-H06/H07: BE chưa có module sự cố (handoff 008 #5). */
export function OrderIncidentCard() {
  return (
    <Card>
      <Title order={5}>Sự cố</Title>
      <EmptyState
        icon={<LuTriangleAlert size={32} />}
        title="Chưa hỗ trợ lập phiếu sự cố"
        description="Phiếu sự cố của đơn sẽ hiện ở đây."
      />
    </Card>
  )
}
