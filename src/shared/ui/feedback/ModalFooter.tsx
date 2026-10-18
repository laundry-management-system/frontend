import { Group } from '@mantine/core'
import type { ReactNode } from 'react'

/** Hàng nút cuối modal: divider phía trên tràn hết bề ngang modal, nút căn phải. */
export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <Group
      justify="flex-end"
      gap="sm"
      mt="md"
      pt="md"
      // Mantine dùng --mb-padding cho padding body; margin âm để viền chạm mép modal
      mx="calc(var(--mb-padding) * -1)"
      px="var(--mb-padding)"
      style={{ borderTop: '1px solid var(--ds-border)' }}
    >
      {children}
    </Group>
  )
}
