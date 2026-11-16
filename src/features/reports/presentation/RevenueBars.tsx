import { Box, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { useState } from 'react'
import { LuChartColumn } from 'react-icons/lu'
import { formatMoney } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui'
import { barHeights, compactMoney, niceTicks } from '../domain/dashboard'
import type { DailyRevenue } from '../domain/types'
import { RevenueDayModal } from './RevenueDayModal'

const CHART_HEIGHT = 180
const AXIS_WIDTH = 44

interface RevenueBarsProps {
  rows: DailyRevenue[]
}

/** Cột doanh thu theo ngày; bấm vào cột để xem các giao dịch của ngày đó. */
export function RevenueBars({ rows }: RevenueBarsProps) {
  const [openDate, setOpenDate] = useState<string | null>(null)
  const openDay = (date: string) => setOpenDate(date)
  const closeModal = () => setOpenDate(null)
  const totals = rows.map((r) => r.total)
  const ticks = niceTicks(Math.max(0, ...totals))
  const top = ticks[ticks.length - 1]
  const heights = barHeights(totals, top)
  if (top === 0)
    return (
      <EmptyState
        icon={<LuChartColumn size={32} />}
        title="Chưa có doanh thu"
        description="Doanh thu 14 ngày gần nhất sẽ hiện ở đây."
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
              const label = `${dayjs(r.date).format('DD/MM')}: ${formatMoney(r.total)}`
              return (
                <Stack key={r.date} gap={4} align="center" style={{ flex: 1, minWidth: 0 }}>
                  <Tooltip label={label}>
                    <UnstyledButton
                      className="ds-revenue-bar"
                      h={CHART_HEIGHT}
                      w="100%"
                      disabled={r.total === 0}
                      aria-label={r.total > 0 ? `${label}, xem giao dịch` : label}
                      onClick={() => openDay(r.date)}
                    >
                      <Box h={r.total > 0 ? Math.max(2, heights[i] * CHART_HEIGHT) : 0} />
                    </UnstyledButton>
                  </Tooltip>
                  <Text size="xs" c="dimmed" visibleFrom={i % 2 ? 'md' : undefined}>
                    {dayjs(r.date).format('DD/MM')}
                  </Text>
                </Stack>
              )
            })}
          </Box>
        </Box>
      </Box>
      {openDate && <RevenueDayModal date={openDate} onClose={closeModal} />}
    </>
  )
}
