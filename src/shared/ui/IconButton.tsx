import { ActionIcon, Tooltip } from '@mantine/core'
import type { ReactNode } from 'react'

interface IconButtonProps {
  /** Vừa là tooltip vừa là aria-label (DS: Icon Button luôn kèm Tooltip) */
  label: string
  icon: ReactNode
  variant?: 'filled' | 'outline' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function IconButton({ label, icon, variant = 'subtle', size, onClick }: IconButtonProps) {
  return (
    <Tooltip label={label}>
      <ActionIcon
        aria-label={label}
        variant={variant}
        color={variant === 'filled' ? undefined : 'neutral'}
        size={size}
        onClick={onClick}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  )
}
