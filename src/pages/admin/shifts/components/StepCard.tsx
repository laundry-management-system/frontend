import { Card, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import type { ReactNode } from 'react'
import { LuCheck } from 'react-icons/lu'

interface StepCardProps {
  step: number
  title: string
  done: boolean
  children: ReactNode
}

/** Một bước của quy trình kết ca: số thứ tự (thành dấu ✓ khi xong), tiêu đề, nội dung. */
export function StepCard({ step, title, done, children }: StepCardProps) {
  return (
    <Card>
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon
            radius="xl"
            size={28}
            color={done ? 'success' : 'neutral'}
            variant={done ? 'filled' : 'light'}
            aria-label={done ? `Bước ${step}: đã xong` : `Bước ${step}`}
          >
            {done ? (
              <LuCheck size={16} />
            ) : (
              <Text size="sm" fw={700}>
                {step}
              </Text>
            )}
          </ThemeIcon>
          <Text fw={700} size="lg">
            {title}
          </Text>
        </Group>
        {children}
      </Stack>
    </Card>
  )
}
