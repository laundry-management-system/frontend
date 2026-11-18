import { Menu, Skeleton } from '@mantine/core'
import { LuChevronDown, LuCircleUser, LuLogIn, LuLogOut } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import { useCustomerLogout } from '../application/mutations/useCustomerLogout'
import { useMyProfile } from '../application/queries/useMyProfile'
import { useCustomerSessionStore } from '../application/sessionStore'

const TRIGGER_CLASS = 'pub-btn pub-btn--ghost max-w-56'
const ITEM_CLASSES = { item: 'min-h-11! text-(length:--pub-text-md)!' }

function UserMenu() {
  const { data } = useMyProfile()
  const logout = useCustomerLogout()
  const handleLogout = () => logout.mutate()

  return (
    <Menu position="bottom-end" withinPortal={false} classNames={ITEM_CLASSES}>
      <Menu.Target>
        <button type="button" className={TRIGGER_CLASS}>
          <LuCircleUser size={18} aria-hidden="true" />
          <span className="truncate">{data?.fullName ?? 'Tài khoản'}</span>
          <LuChevronDown size={16} aria-hidden="true" />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={PATHS.customerAccount}
          leftSection={<LuCircleUser size={18} />}
        >
          Tài khoản của tôi
        </Menu.Item>
        <Menu.Item onClick={handleLogout} leftSection={<LuLogOut size={18} />}>
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

/** Nút đăng nhập / menu tài khoản trên header trang công khai. */
export function AccountMenu() {
  const status = useCustomerSessionStore((s) => s.status)
  if (status === 'unknown') return <Skeleton h={44} w={132} radius="sm" aria-hidden="true" />
  if (status === 'authenticated') return <UserMenu />
  return (
    <Link to={PATHS.customerLogin} className={TRIGGER_CLASS}>
      <LuLogIn size={18} aria-hidden="true" />
      Đăng nhập
    </Link>
  )
}
