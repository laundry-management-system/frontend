import { Tooltip } from '@mantine/core'
import { LuChartLine } from 'react-icons/lu'
import { formatNumber } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui'
import { niceTicks } from '../domain/dashboard'
import { periodLabel } from '../domain/report'
import type { ReportMode } from '../domain/types'

const W = 640
const H = 220
const PAD = { top: 10, right: 12, bottom: 24, left: 36 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom
const LINE_COLOR = 'var(--ds-primary)'

interface OrdersLineProps {
  rows: { period: string; received: number }[]
  mode: ReportMode
}

export function OrdersLine({ rows, mode }: OrdersLineProps) {
  const max = Math.max(0, ...rows.map((r) => r.received))
  if (max === 0)
    return (
      <EmptyState
        icon={<LuChartLine size={32} />}
        title="Chưa có đơn trong kỳ"
        description="Số đơn nhận theo từng mốc sẽ hiện ở đây."
      />
    )

  const ticks = niceTicks(Math.max(max, 4)).filter((t) => Number.isInteger(t))
  const top = ticks[ticks.length - 1]
  const x = (i: number) =>
    PAD.left + (rows.length === 1 ? PLOT_W / 2 : (i * PLOT_W) / (rows.length - 1))
  const y = (v: number) => PAD.top + PLOT_H - (v / top) * PLOT_H
  const points = rows.map((r, i) => `${x(i)},${y(r.received)}`).join(' ')
  // Nhiều mốc thì chỉ ghi nhãn cách quãng cho khỏi chồng chữ
  const step = Math.ceil(rows.length / 12)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Số đơn theo mốc">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--ds-border)"
            strokeDasharray="4 4"
          />
          <text
            x={PAD.left - 6}
            y={y(t)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--mantine-color-dimmed)"
          >
            {formatNumber(t)}
          </text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke={LINE_COLOR} strokeWidth={2} />
      {rows.map((r, i) => (
        <g key={r.period}>
          <Tooltip label={`${periodLabel(r.period, mode)}: ${formatNumber(r.received)} đơn`}>
            <circle cx={x(i)} cy={y(r.received)} r={4} fill={LINE_COLOR} />
          </Tooltip>
          {i % step === 0 && (
            <text
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize={11}
              fill="var(--mantine-color-dimmed)"
            >
              {periodLabel(r.period, mode)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
