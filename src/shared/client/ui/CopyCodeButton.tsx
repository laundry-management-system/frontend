import { ActionIcon, CopyButton, Tooltip } from '@mantine/core'
import { LuCheck, LuCopy } from 'react-icons/lu'

/** Nút sao chép mã (mã đơn…) kèm tooltip "Đã sao chép"; dùng được trong card/link vì không kích hoạt điều hướng. */
export function CopyCodeButton({
  code,
  label = 'Sao chép mã đơn',
}: {
  code: string
  label?: string
}) {
  return (
    <CopyButton value={code} timeout={1500}>
      {({ copied, copy }) => (
        <Tooltip label="Đã sao chép" opened={copied} withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={28}
            className="relative z-10"
            aria-label={label}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              copy()
            }}
          >
            {copied ? (
              <LuCheck size={16} aria-hidden="true" />
            ) : (
              <LuCopy size={16} aria-hidden="true" />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  )
}
