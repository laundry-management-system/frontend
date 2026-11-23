import { Card, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuChevronRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'

type Tone = 'neutral' | 'danger' | 'warning'

interface KpiCardProps {
  icon: ReactNode
  label: ReactNode
  value: ReactNode
  /** Luôn có một dòng để các thẻ cao bằng nhau */
  note: ReactNode
  tone?: Tone
  to?: string
  onClick?: () => void
}

const VALUE_COLOR: Record<Tone, string | undefined> = {
  neutral: undefined,
  danger: 'var(--tone-danger-fg)',
  warning: 'var(--tone-warning-fg)',
}

export function KpiCard({ icon, label, value, note, tone = 'neutral', to, onClick }: KpiCardProps) {
  const clickable = Boolean(to || onClick)
  const content = (
    <Card h="100%" className={clickable ? 'ds-kpi-card ds-kpi-card--link' : 'ds-kpi-card'}>
      <Group justify="space-between" wrap="nowrap" mb="sm">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color={tone} size="md" radius="md">
            {icon}
          </ThemeIcon>
          <Text size="sm" c="dimmed" fw={500}>
            {label}
          </Text>
        </Group>
        {clickable && <LuChevronRight size={16} aria-hidden className="text-muted-foreground" />}
      </Group>
      <Text className="text-numeric-display" style={{ color: VALUE_COLOR[tone] }}>
        {value}
      </Text>
      <Text size="sm" c="dimmed" mt={4} component="div">
        {note}
      </Text>
    </Card>
  )
  if (to)
    return (
      <UnstyledButton component={Link} to={to} h="100%" display="block">
        {content}
      </UnstyledButton>
    )
  if (onClick)
    return (
      <UnstyledButton onClick={onClick} h="100%" display="block" w="100%" ta="left">
        {content}
      </UnstyledButton>
    )
  return content
}
