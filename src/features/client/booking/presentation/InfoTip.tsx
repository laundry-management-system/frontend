import { ActionIcon, Tooltip } from '@mantine/core'
import { LuInfo } from 'react-icons/lu'

/** Dấu (i) giải thích ngắn: hover, focus bàn phím hoặc chạm. */
export function InfoTip({ label }: { label: string }) {
  return (
    <Tooltip
      label={label}
      multiline
      w={260}
      withArrow
      events={{ hover: true, focus: true, touch: true }}
    >
      <ActionIcon
        variant="transparent"
        color="gray"
        size={16}
        radius="xl"
        aria-label={label}
        className="relative before:absolute before:-inset-3.5 before:content-['']"
      >
        <LuInfo size={16} aria-hidden="true" />
      </ActionIcon>
    </Tooltip>
  )
}
