// Vẽ theo khổ drawer để chữ không bị thu nhỏ
const W = 400
const H = 180
const PAD = { top: 10, right: 12, bottom: 24, left: 44 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom
const LINE_COLOR = 'var(--ds-primary)'
const DAY_MS = 24 * 60 * 60 * 1000
const MIN_LABEL_GAP = 56

const shortMoney = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))
const pad = (n: number) => String(n).padStart(2, '0')
const dayMonth = (t: number) => {
  const d = new Date(t)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`
}

interface PriceLineProps {
  points: { at: string; price: number }[]
  now?: Date
}

/** Đơn giá theo thời gian, dạng bậc thang: giá giữ nguyên tới lần đổi kế tiếp */
export function PriceLine({ points, now = new Date() }: PriceLineProps) {
  if (points.length < 2) return null

  const times = points.map((p) => new Date(p.at).getTime())
  const end = Math.max(now.getTime(), times[times.length - 1])
  // Giá cũ không rõ có từ khi nào: chừa một đoạn ở đầu trục để vẫn thấy được, kể cả khi vừa đổi hôm nay
  const start = times[0] - Math.max(end - times[0], DAY_MS) * 0.25
  const prices = points.map((p) => p.price)
  const top = Math.max(...prices) * 1.1
  const bottom = Math.min(...prices) * 0.8
  const x = (t: number) =>
    PAD.left + (end === start ? PLOT_W / 2 : ((t - start) / (end - start)) * PLOT_W)
  const y = (v: number) => PAD.top + PLOT_H - ((v - bottom) / (top - bottom || 1)) * PLOT_H

  const steps = [`${x(start)},${y(prices[0])}`].concat(
    points.flatMap((p, i) => {
      const nextT = i + 1 < times.length ? times[i + 1] : end
      return [`${x(times[i])},${y(p.price)}`, `${x(nextT)},${y(p.price)}`]
    }),
  )
  // Chỉ ghi giá thấp nhất / cao nhất và các ngày đủ xa nhau, tránh chữ đè nhau khi đổi giá dày
  const yTicks = [...new Set([Math.min(...prices), Math.max(...prices)])]
  const labeled = times
    .slice(1)
    .reduce<number[]>(
      (kept, t) =>
        kept.length && x(t) - x(kept[kept.length - 1]) < MIN_LABEL_GAP ? kept : [...kept, t],
      [],
    )
  const label = `Đơn giá từ ${shortMoney(prices[0])} thành ${shortMoney(prices[prices.length - 1])} qua ${points.length - 1} lần đổi`

  return (
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
      <polyline points={steps.join(' ')} fill="none" stroke={LINE_COLOR} strokeWidth={2} />
      {times.slice(1).map((t, i) => (
        <g key={t}>
          <circle cx={x(t)} cy={y(prices[i + 1])} r={3.5} fill={LINE_COLOR} />
          {labeled.includes(t) && (
            <text
              x={x(t)}
              y={H - 6}
              textAnchor={x(t) > W - PAD.right - 24 ? 'end' : 'middle'}
              fontSize={11}
              fill="var(--mantine-color-dimmed)"
            >
              {dayMonth(t)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
