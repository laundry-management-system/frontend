import { ActionIcon, Menu } from '@mantine/core'
import { LuEllipsisVertical } from 'react-icons/lu'

export interface RowAction {
  label: string
  onClick: () => void
  /** Thao tác hủy / vô hiệu hóa: chữ đỏ */
  danger?: boolean
  /** Ẩn khi không áp dụng cho dòng này */
  hidden?: boolean
}

/** Cột thao tác cuối mỗi dòng bảng: nút ⋯ mở menu (dùng thống nhất ở mọi màn danh sách). */
export function RowActions({ items }: { items: RowAction[] }) {
  const visible = items.filter((i) => !i.hidden)
  if (!visible.length) return null
  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon variant="subtle" color="neutral" aria-label="Thao tác">
          <LuEllipsisVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {visible.map((i) => (
          <Menu.Item key={i.label} color={i.danger ? 'red' : undefined} onClick={i.onClick}>
            {i.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
