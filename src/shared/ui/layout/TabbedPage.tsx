import { Paper, Stack, Tabs } from '@mantine/core'
import type { ReactNode } from 'react'
import { useTabParam } from '../../hooks/useTabParam'

export interface TabDef {
  value: string
  label: string
  content: ReactNode
}

/** Gom các trang cùng một đối tượng thành tab; chỉ tab đang chọn được mount nên tab ẩn không gọi API. */
export function TabbedPage({ tabs, sharedKeys }: { tabs: TabDef[]; sharedKeys?: string[] }) {
  const values = tabs.map((t) => t.value)
  const { tab, setTab } = useTabParam(values, sharedKeys)

  if (tabs.length === 1) return tabs[0].content

  const handleChange = (value: string | null) => value && setTab(value)

  return (
    <Tabs value={tab} onChange={handleChange} keepMounted={false}>
      <Stack gap="md">
        <Paper withBorder radius="lg" shadow="xs" px="xs" py={4} bg="var(--ds-card)">
          <Tabs.List style={{ '--tab-border-color': 'transparent' }}>
            {tabs.map((t) => (
              <Tabs.Tab key={t.value} value={t.value}>
                {t.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Paper>
        {tabs.map((t) => (
          <Tabs.Panel key={t.value} value={t.value}>
            {t.content}
          </Tabs.Panel>
        ))}
      </Stack>
    </Tabs>
  )
}
