import { Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { InfoTooltip } from '../feedback/InfoTooltip'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Ghi chú phụ hiện trong InfoTooltip cạnh tiêu đề */
  info?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, info, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="lg">
      <Stack gap={4}>
        <Group gap={6} wrap="nowrap">
          <Title order={2}>{title}</Title>
          {info && <InfoTooltip content={info} />}
        </Group>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      {actions}
    </Group>
  )
}
