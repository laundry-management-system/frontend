import { Paper, Stack, Tabs } from '@mantine/core'
import { type ReactNode, useState } from 'react'
import { useTabParam } from '../../hooks/useTabParam'
import { TabSlotsContext } from './tabSlots'

export interface TabDef {
  value: string
  label: string
  content: ReactNode
}

/** Gom các trang cùng một đối tượng thành tab; chỉ tab đang chọn được mount nên tab ẩn không gọi API. */
export function TabbedPage({ tabs, sharedKeys }: { tabs: TabDef[]; sharedKeys?: string[] }) {
  const values = tabs.map((t) => t.value)
  const { tab, setTab } = useTabParam(values, sharedKeys)
  const [header, setHeader] = useState<HTMLElement | null>(null)
  const [filters, setFilters] = useState<HTMLElement | null>(null)

  if (tabs.length === 1) return tabs[0].content

  const handleChange = (value: string | null) => value && setTab(value)

  return (
    <Tabs value={tab} onChange={handleChange} keepMounted={false}>
      <TabSlotsContext.Provider value={{ header, filters }}>
        <Stack gap="md">
          <div>
            <div ref={setHeader} />
            <Paper withBorder radius="lg" shadow="xs" pt="sm" bg="var(--ds-card)">
              <Tabs.List
                px="md"
                style={{
                  '--tab-border-color': 'transparent',
                  '--tab-hover-color': 'transparent',
                  borderBottom: '1px solid var(--mantine-color-default-border)',
                }}
              >
                {tabs.map((t) => (
                  <Tabs.Tab key={t.value} value={t.value}>
                    {t.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              <div ref={setFilters} />
            </Paper>
          </div>
          {tabs.map((t) => (
            <Tabs.Panel key={t.value} value={t.value}>
              {t.content}
            </Tabs.Panel>
          ))}
        </Stack>
      </TabSlotsContext.Provider>
    </Tabs>
  )
}
