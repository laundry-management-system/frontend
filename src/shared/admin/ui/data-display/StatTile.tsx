import { Card } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuMinus, LuTrendingDown, LuTrendingUp } from 'react-icons/lu'

interface StatTileProps {
  label: string
  value: ReactNode
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

const TREND = {
  up: { icon: LuTrendingUp, className: 'text-tone-success-fg' },
  down: { icon: LuTrendingDown, className: 'text-tone-danger-fg' },
  flat: { icon: LuMinus, className: 'text-muted-foreground' },
}

export function StatTile({ label, value, delta, trend = 'flat' }: StatTileProps) {
  const { icon: Icon, className } = TREND[trend]
  return (
    <Card>
      <div className="text-label-sm text-muted-foreground">{label}</div>
      <div className="text-numeric-display mt-1">{value}</div>
      {delta && (
        <div className={`text-caption mt-1 flex items-center gap-1 ${className}`}>
          <Icon size={14} />
          {delta}
        </div>
      )}
    </Card>
  )
}
