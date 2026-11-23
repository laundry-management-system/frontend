import { Box, ColorSwatch, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import { LuChartColumn } from 'react-icons/lu'
import { formatMoney } from '@/shared/common/lib/format'
import { EmptyState } from '@/shared/admin/ui'
import { barHeights, compactMoney, niceTicks } from '../domain/dashboard'
import { periodBounds, periodLabel } from '../domain/report'
import type { DateRange, ReportMode, RevenueRow } from '../domain/types'
import { BANK_COLOR, CASH_COLOR } from './paymentColors'
import type { OrderChannel } from '@/features/admin/orders'
import { RevenueDayModal } from './RevenueDayModal'

const CHART_HEIGHT = 180
const AXIS_WIDTH = 44
export interface BarSeries {
  label: string
  color: string
  value: (r: RevenueRow) => number
}
// Thứ tự: phần dưới trước, phần trên sau
const METHOD_SERIES: BarSeries[] = [
  { label: 'Tiền mặt', color: CASH_COLOR, value: (r) => r.cash },
  { label: 'Chuyển khoản', color: BANK_COLOR, value: (r) => r.bankTransfer },
]
// Không có kỳ thì cột tháng lấy trọn tháng
const NO_CLIP = { from: '0000-01-01', to: '9999-12-31' }

interface RevenueBarsProps {
  rows: RevenueRow[]
  /** Tách mỗi cột thành các phần của series */
  split?: boolean
  /** Các phần xếp chồng khi split; mặc định tiền mặt / chuyển khoản */
  series?: BarSeries[]
  mode?: ReportMode
  /** Kỳ đang xem, để cắt khoảng ngày của cột tháng đầu / cuối */
  range?: DateRange
  emptyText?: string
  channel?: OrderChannel
}

/** Cột doanh thu theo ngày / tháng; bấm vào cột để xem các giao dịch tạo nên cột đó. */
export function RevenueBars({
  rows,
  split = false,
  series = METHOD_SERIES,
  mode = 'day',
  range,
  emptyText = 'Doanh thu 14 ngày gần nhất sẽ hiện ở đây.',
  channel,
}: RevenueBarsProps) {
  const [openRow, setOpenRow] = useState<RevenueRow | null>(null)
  const openColumn = (r: RevenueRow) => setOpenRow(r)
  const closeModal = () => setOpenRow(null)
  const totals = rows.map((r) => r.total)
  const ticks = niceTicks(Math.max(0, ...totals))
  const top = ticks[ticks.length - 1]
  const heights = barHeights(totals, top)
  if (top === 0)
    return (
      <EmptyState
        icon={<LuChartColumn size={32} />}
        title="Chưa có doanh thu"
        description={emptyText}
      />
    )

  const tooltipOf = (r: RevenueRow) => {
    const head = `${periodLabel(r.period, mode)}: ${formatMoney(r.total)}`
    return split
      ? [head, ...series.map((s) => `${s.label} ${formatMoney(s.value(r))}`)].join(' · ')
      : head
  }
  const barFill = (r: RevenueRow, height: number) =>
    split ? (
      <Box h={height} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {[...series].reverse().map((s) => (
          <Box key={s.label} style={{ flex: s.value(r), background: s.color }} />
        ))}
      </Box>
    ) : (
      <Box h={height} />
    )
  const legend = split && (
    <Group gap="md" mt="sm" justify="center">
      {series.map((l) => (
        <Group key={l.label} gap={6}>
          <ColorSwatch color={l.color} size={10} withShadow={false} />
          <Text size="xs" c="dimmed">
            {l.label}
          </Text>
        </Group>
      ))}
    </Group>
  )
  // Nhiều cột thì chỉ hiện nhãn cách quãng cho khỏi chồng chữ
  const step = Math.ceil(rows.length / 16)
  const modal = openRow && (
    <RevenueDayModal
      range={periodBounds(openRow.period, mode, range ?? NO_CLIP)}
      title={`Doanh thu ${mode === 'month' ? 'tháng' : 'ngày'} ${periodLabel(openRow.period, mode)}`}
      expectedCount={openRow.paymentCount}
      channel={channel}
      onClose={closeModal}
    />
  )

  return (
    <>
      <Box style={{ display: 'flex', gap: 8 }}>
        <Box pos="relative" w={AXIS_WIDTH} h={CHART_HEIGHT} style={{ flexShrink: 0 }} aria-hidden>
          {ticks.map((t) => (
            <Text
              key={t}
              size="xs"
              c="dimmed"
              ta="right"
              w="100%"
              pos="absolute"
              bottom={(t / top) * CHART_HEIGHT}
              style={{ transform: 'translateY(50%)' }}
            >
              {compactMoney(t)}
            </Text>
          ))}
        </Box>
        <Box pos="relative" style={{ flex: 1, minWidth: 0 }}>
          {ticks.map((t) => (
            <Box
              key={t}
              className="ds-chart-gridline"
              pos="absolute"
              left={0}
              right={0}
              top={CHART_HEIGHT - (t / top) * CHART_HEIGHT}
            />
          ))}
          <Box pos="relative" style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            {rows.map((r, i) => {
              const label = tooltipOf(r)
              return (
                <Stack key={r.period} gap={4} align="center" style={{ flex: 1, minWidth: 0 }}>
                  <Tooltip label={label}>
                    <UnstyledButton
                      className={split ? 'ds-revenue-bar ds-revenue-bar--split' : 'ds-revenue-bar'}
                      h={CHART_HEIGHT}
                      w="100%"
                      disabled={r.total === 0}
                      aria-label={r.total > 0 ? `${label}, xem giao dịch` : label}
                      onClick={() => openColumn(r)}
                    >
                      {barFill(r, r.total > 0 ? Math.max(2, heights[i] * CHART_HEIGHT) : 0)}
                    </UnstyledButton>
                  </Tooltip>
                  <Text
                    size="xs"
                    c="dimmed"
                    visibleFrom={step === 1 && i % 2 ? 'md' : undefined}
                    style={{ visibility: i % step ? 'hidden' : undefined, whiteSpace: 'nowrap' }}
                  >
                    {periodLabel(r.period, mode)}
                  </Text>
                </Stack>
              )
            })}
          </Box>
        </Box>
      </Box>
      {legend}
      {modal}
    </>
  )
}
