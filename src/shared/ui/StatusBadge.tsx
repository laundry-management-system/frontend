import { Badge } from '@mantine/core'
import type { IconType } from 'react-icons'
import { LuPackage, LuQrCode, LuStar, LuTriangleAlert, LuWallet, LuZap } from 'react-icons/lu'
import {
  statusOf,
  type DomainStatus,
  type StatusGroup,
  type StatusIcon,
} from '../config/domainStatuses'

const ICONS: Record<StatusIcon, IconType> = {
  wallet: LuWallet,
  'qr-code': LuQrCode,
  'triangle-alert': LuTriangleAlert,
  zap: LuZap,
  star: LuStar,
  package: LuPackage,
}

interface StatusBadgeProps {
  group: StatusGroup
  statusKey: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ group, statusKey, size = 'md' }: StatusBadgeProps) {
  let status: DomainStatus
  try {
    status = statusOf(group, statusKey)
  } catch (e) {
    if (import.meta.env.DEV) throw e
    // Production: không tô màu tùy ý, không làm sập màn hình
    console.error(e)
    return (
      <Badge color="neutral" variant="light" size={size}>
        {group}/{statusKey}
      </Badge>
    )
  }
  const Icon = status.icon && ICONS[status.icon]
  return (
    <Badge
      color={status.tone}
      variant={status.solid ? 'filled' : 'light'}
      size={size}
      leftSection={Icon && <Icon size={12} />}
    >
      {status.label}
    </Badge>
  )
}
