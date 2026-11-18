import { Paper, Text } from '@mantine/core'
import { useState } from 'react'
import { formatMoney } from '@/shared/common/lib/format'
import { formatChangedAt } from '../domain/priceHistory'

// Vẽ theo khổ drawer để chữ không bị thu nhỏ
const W = 400
const H = 180
const PAD = { top: 10, right: 12, bottom: 24, left: 44 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom
const LINE_COLOR = 'var(--ds-primary)'
const MIN_LABEL_GAP = 56

const shortMoney = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))
const pad = (n: number) => String(n).padStart(2, '0')
const dayMonth = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`
}

// Kẹp vào giữa để hộp không tràn ra ngoài drawer ở hai đầu biểu đồ
const clampPercent = (v: number) => Math.min(Math.max(v, 18), 82)

function PriceLineTooltip({ price, when, left }: { price: number; when: string; left: number }) {
  return (
    <Paper
      withBorder
      shadow="sm"
      radius="md"
      px="xs"
      py={4}
      pos="absolute"
      top={0}
      left={`${clampPercent(left)}%`}
      style={{ transform: 'translateX(-50%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
    >
      <Text size="sm" fw={600} className="text-money">
        {formatMoney(price)}
      </Text>
      <Text size="xs" c="dimmed">
        {when}
      </Text>
    </Paper>
  )
}

/**
 * Đơn giá qua từng lần đổi, dạng bậc thang. Mỗi lần đổi cách đều nhau trên trục ngang (không theo thời gian thật)
 * để nhiều lần đổi sát nhau vẫn thấy đủ từng bậc; rê chuột vào một đoạn thì hiện giá và thời điểm áp dụng.
 */
export function PriceLine({ points }: { points: { at: string; price: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  if (points.length < 2) return null

  const prices = points.map((p) => p.price)
  const top = Math.max(...prices) * 1.1
  const bottom = Math.min(...prices) * 0.8
  // Ô 0 là giá trước lần đổi đầu tiên; lần đổi thứ i nằm ở ô i; đoạn cuối kéo tới mép phải (hiện tại)
  const x = (slot: number) => PAD.left + (slot / points.length) * PLOT_W
  const y = (v: number) => PAD.top + PLOT_H - ((v - bottom) / (top - bottom || 1)) * PLOT_H

  const steps = points.flatMap((p, i) => [`${x(i)},${y(p.price)}`, `${x(i + 1)},${y(p.price)}`])
  // Chỉ ghi giá thấp nhất / cao nhất và các ngày đủ xa nhau, không lặp ngày, tránh chữ đè nhau
  const yTicks = [...new Set([Math.min(...prices), Math.max(...prices)])]
  const labeled = points
    .slice(1)
    .map((p, i) => ({ slot: i + 1, text: dayMonth(p.at) }))
    .reduce<{ slot: number; text: string }[]>((kept, l) => {
      const prev = kept.at(-1)
      return prev && (prev.text === l.text || x(l.slot) - x(prev.slot) < MIN_LABEL_GAP)
        ? kept
        : [...kept, l]
    }, [])
  const clearHover = () => setHovered(null)
  // Đoạn 0 là giá trước lần đổi đầu tiên; đoạn i áp dụng từ lần đổi thứ i
  const hoverText = (slot: number) =>
    slot === 0 ? `Trước ${formatChangedAt(points[1].at)}` : `Từ ${formatChangedAt(points[slot].at)}`
  const tooltip = hovered != null && (
    <PriceLineTooltip
      price={points[hovered].price}
      when={hoverText(hovered)}
      left={(x(hovered + 0.5) / W) * 100}
    />
  )
  const label = `Đơn giá từ ${shortMoney(prices[0])} thành ${shortMoney(prices[prices.length - 1])} qua ${points.length - 1} lần đổi`

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label}>
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--ds-border)"
              strokeDasharray="3 3"
            />
            <text
              x={PAD.left - 6}
              y={y(v) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--mantine-color-dimmed)"
            >
              {shortMoney(v)}
            </text>
          </g>
        ))}
        {hovered != null && (
          <line
            x1={x(hovered + 0.5)}
            x2={x(hovered + 0.5)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            stroke="var(--ds-border)"
          />
        )}
        <polyline points={steps.join(' ')} fill="none" stroke={LINE_COLOR} strokeWidth={2} />
        {points.slice(1).map((p, i) => (
          <circle key={i} cx={x(i + 1)} cy={y(p.price)} r={3.5} fill={LINE_COLOR} />
        ))}
        {hovered != null && (
          <circle cx={x(hovered + 0.5)} cy={y(points[hovered].price)} r={4.5} fill={LINE_COLOR} />
        )}
        {points.map((_, i) => (
          <rect
            key={i}
            x={x(i)}
            y={PAD.top}
            width={x(i + 1) - x(i)}
            height={PLOT_H}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={clearHover}
          />
        ))}
        {labeled.map((l) => (
          <text
            key={l.slot}
            x={x(l.slot)}
            y={H - 6}
            textAnchor={x(l.slot) > W - PAD.right - 24 ? 'end' : 'middle'}
            fontSize={11}
            fill="var(--mantine-color-dimmed)"
          >
            {l.text}
          </text>
        ))}
      </svg>
      {tooltip}
    </div>
  )
}
