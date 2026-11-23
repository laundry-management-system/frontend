import { Group, Progress, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
const PODIUM_TONES = ['warning', 'neutral', 'express'] as const
const PODIUM_SIZE = PODIUM_TONES.length

export interface LeaderboardItem {
  key: string | number
  name: string
  code?: ReactNode
  /** Giá trị xếp hạng, cũng quyết định độ dài thanh so với hạng 1 */
  value: number
  primary: ReactNode
  /** Dòng cuối thẻ top 3 */
  podiumFoot?: ReactNode
  /** Cột phụ ở dòng hạng 4+ */
  rowExtra?: ReactNode
  onOpen?: () => void
}

function RankBadge({ rank, tone, size }: { rank: number; tone: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        background: `var(--tone-${tone}-solid)`,
        color: `var(--tone-${tone}-solid-fg)`,
        ...TABULAR,
      }}
    >
      {rank}
    </div>
  )
}

function PodiumCard({ item, rank }: { item: LeaderboardItem; rank: number }) {
  const tone = PODIUM_TONES[rank - 1]
  return (
    <UnstyledButton
      component={item.onOpen ? 'button' : 'div'}
      onClick={item.onOpen}
      style={{
        padding: 'var(--mantine-spacing-md)',
        borderRadius: 'var(--mantine-radius-md)',
        border: `1px solid var(--tone-${tone}-border)`,
        background: `var(--tone-${tone}-bg)`,
      }}
    >
      <Stack gap="xs">
        <Group gap="sm" wrap="nowrap">
          <RankBadge rank={rank} tone={tone} size={rank === 1 ? 40 : 34} />
          <div style={{ minWidth: 0 }}>
            <Text fw={600} truncate title={item.name}>
              {item.name}
            </Text>
            {item.code}
          </div>
        </Group>
        <Text fw={700} fz={rank === 1 ? 28 : 22} style={TABULAR}>
          {item.primary}
        </Text>
        {item.podiumFoot}
      </Stack>
    </UnstyledButton>
  )
}

function RankRow({ item, rank, max }: { item: LeaderboardItem; rank: number; max: number }) {
  return (
    <UnstyledButton component={item.onOpen ? 'button' : 'div'} onClick={item.onOpen} py={8}>
      <Group gap="md" wrap="nowrap">
        <Text w={24} ta="center" fw={600} c="dimmed" style={TABULAR}>
          {rank}
        </Text>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" fw={500} truncate title={item.name}>
              {item.name}
            </Text>
            {item.code}
          </Group>
          <Progress value={max > 0 ? (item.value * 100) / max : 0} size={6} mt={6} />
        </div>
        {item.rowExtra}
        <Text size="sm" fw={600} ta="right" style={{ ...TABULAR, minWidth: 70 }}>
          {item.primary}
        </Text>
      </Group>
    </UnstyledButton>
  )
}

/** Bảng xếp hạng thi đua: top 3 dạng bục (vàng/bạc/đồng), hạng 4+ dạng danh sách gọn có thanh so với hạng 1. */
export function Leaderboard({ items }: { items: LeaderboardItem[] }) {
  const podium = items.slice(0, PODIUM_SIZE)
  const rest = items.slice(PODIUM_SIZE)
  const max = items[0]?.value ?? 0
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: Math.max(1, podium.length) }} spacing="md">
        {podium.map((it, i) => (
          <PodiumCard key={it.key} item={it} rank={i + 1} />
        ))}
      </SimpleGrid>
      {rest.length > 0 && (
        <Stack gap={0}>
          {rest.map((it, i) => (
            <RankRow key={it.key} item={it} rank={i + PODIUM_SIZE + 1} max={max} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
