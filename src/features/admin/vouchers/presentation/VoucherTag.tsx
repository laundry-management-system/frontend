import { Badge } from '@mantine/core'
import { LuTicketPercent } from 'react-icons/lu'
import { EntityCode } from '@/shared/admin/ui'

export function VoucherTag({ code }: { code: string }) {
  return (
    <Badge
      size="sm"
      color="primary"
      leftSection={<LuTicketPercent size={12} aria-hidden />}
      aria-label={`Voucher ${code}`}
    >
      <EntityCode code={code} size="sm" />
    </Badge>
  )
}
