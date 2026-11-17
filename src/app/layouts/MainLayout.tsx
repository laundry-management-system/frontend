import {
  AppShell,
  Burger,
  Button,
  Group,
  NavLink,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core'
import { useState } from 'react'
import {
  LuArchive,
  LuChartColumn,
  LuChartPie,
  LuContact,
  LuFileText,
  LuLayoutDashboard,
  LuListTodo,
  LuLockOpen,
  LuLogOut,
  LuMoon,
  LuPackagePlus,
  LuPackageSearch,
  LuReceiptText,
  LuSettings,
  LuSun,
  LuTags,
  LuTicketPercent,
  LuUsers,
  LuWallet,
  LuWashingMachine,
} from 'react-icons/lu'
import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout, ROLE_LABEL, type Role, useAuthStore } from '@/features/auth'
import { CurrentShiftCard, OpenShiftModal, useCurrentShift } from '@/features/shifts'
import { useMe } from '@/features/users'
import { APP_NAME } from '@/shared/config/constants'
import { useUiStore } from '@/shared/store/uiStore'
import { IconButton } from '@/shared/ui'
import { queryClient } from '../providers/queryClient'

const navItems: { to: string; label: string; icon: typeof LuLayoutDashboard; roles: Role[] }[] = [
  { to: '/', label: 'Tổng quan', icon: LuLayoutDashboard, roles: ['ADMIN'] },
  { to: '/work-list', label: 'Danh sách công việc', icon: LuListTodo, roles: ['ADMIN', 'STAFF'] },
  { to: '/orders', label: 'Đơn hàng', icon: LuReceiptText, roles: ['ADMIN', 'STAFF'] },
  { to: '/stored-orders', label: 'Đồ tồn', icon: LuArchive, roles: ['ADMIN', 'STAFF'] },
  { to: '/machines', label: 'Máy giặt & sấy', icon: LuWashingMachine, roles: ['ADMIN', 'STAFF'] },
  { to: '/intake', label: 'Tạo đơn', icon: LuPackagePlus, roles: ['STAFF'] },
  { to: '/classify', label: 'Phân loại đồ', icon: LuPackageSearch, roles: ['STAFF'] },
  { to: '/customers', label: 'Khách hàng', icon: LuContact, roles: ['ADMIN', 'STAFF'] },
  { to: '/services', label: 'Bảng giá dịch vụ', icon: LuTags, roles: ['ADMIN', 'STAFF'] },
  { to: '/vouchers', label: 'Voucher', icon: LuTicketPercent, roles: ['ADMIN'] },
  { to: '/reports/revenue', label: 'Báo cáo doanh thu', icon: LuChartColumn, roles: ['ADMIN'] },
  { to: '/reports/orders', label: 'Báo cáo đơn & dịch vụ', icon: LuChartPie, roles: ['ADMIN'] },
  { to: '/shifts', label: 'Ca làm việc', icon: LuWallet, roles: ['ADMIN'] },
  { to: '/audit-log', label: 'Nhật ký hệ thống', icon: LuFileText, roles: ['ADMIN'] },
  { to: '/users', label: 'Nhân viên', icon: LuUsers, roles: ['ADMIN'] },
  { to: '/settings', label: 'Cài đặt cửa hàng', icon: LuSettings, roles: ['ADMIN'] },
]

// Hộp thoại Mở ca chỉ tự hiện một lần mỗi phiên đăng nhập (bấm "Để sau" thì không hiện lại)
const SHIFT_PROMPT_KEY = 'laundry-shift-prompted'

const readShiftPrompted = () => {
  try {
    return sessionStorage.getItem(SHIFT_PROMPT_KEY) === '1'
  } catch {
    return false
  }
}

const writeShiftPrompted = (value: boolean) => {
  try {
    if (value) sessionStorage.setItem(SHIFT_PROMPT_KEY, '1')
    else sessionStorage.removeItem(SHIFT_PROMPT_KEY)
  } catch {
    // storage bị chặn: hộp thoại có thể hiện lại khi tải lại trang
  }
}

export function MainLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const user = useAuthStore((s) => s.user)
  const { data: me } = useMe()
  const navigate = useNavigate()
  const roles = user?.roles ?? []
  const { data: shiftState } = useCurrentShift()
  const [shiftPrompted, setShiftPrompted] = useState(readShiftPrompted)
  const [openShiftRequested, setOpenShiftRequested] = useState(false)
  const currentShift = shiftState?.current
  const noShift = shiftState?.current === null
  // Nhân viên đăng nhập mà chưa có ca: tự mở hộp thoại một lần; còn lại mở bằng nút Mở ca trên header
  const openShiftModalOpened =
    noShift && (openShiftRequested || (roles.includes('STAFF') && !shiftPrompted))
  const requestOpenShift = () => setOpenShiftRequested(true)
  // Người mở ca tự kết ca; Admin kết ca thay được cho mọi ca
  const canCloseShift =
    currentShift != null && (roles.includes('ADMIN') || me?.id === currentShift.openedById)
  const goCloseShift = () => currentShift && navigate(`/shifts/${currentShift.id}/close`)

  const closeShiftPrompt = () => {
    writeShiftPrompted(true)
    setShiftPrompted(true)
    setOpenShiftRequested(false)
  }

  const handleLogout = async () => {
    writeShiftPrompted(false)
    await logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: collapsed, desktop: collapsed },
      }}
      padding="var(--ds-page-padding)"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group>
            <Burger
              opened={!collapsed}
              onClick={toggleSidebar}
              size="sm"
              aria-label="Thu gọn menu"
            />
            <Title order={4}>{APP_NAME}</Title>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {currentShift && (
              <CurrentShiftCard
                shift={currentShift}
                onClose={canCloseShift ? goCloseShift : undefined}
              />
            )}
            {noShift && (
              <Button
                size="compact-sm"
                leftSection={<LuLockOpen size={14} />}
                onClick={requestOpenShift}
              >
                Mở ca
              </Button>
            )}
            {user && (
              <Text size="sm">
                {me?.fullName ?? user.username} ·{' '}
                <Text span c="dimmed">
                  {ROLE_LABEL[roles[0]]}
                </Text>
              </Text>
            )}
            <IconButton
              label={colorScheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              icon={colorScheme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
              onClick={toggleColorScheme}
            />
            <IconButton label="Đăng xuất" icon={<LuLogOut size={18} />} onClick={handleLogout} />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        {navItems
          .filter((item) => item.roles.some((r) => roles.includes(r)))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              component={RouterNavLink}
              to={to}
              // Mục con (VD /orders/:id) vẫn sáng mục cha; riêng '/' phải khớp đúng
              end={to === '/'}
              label={label}
              leftSection={<Icon size={18} />}
            />
          ))}
      </AppShell.Navbar>
      <AppShell.Main bg="var(--ds-surface)">
        <Outlet />
      </AppShell.Main>
      <OpenShiftModal
        opened={openShiftModalOpened}
        onClose={closeShiftPrompt}
        staffName={me?.fullName ?? user?.username ?? ''}
      />
    </AppShell>
  )
}
