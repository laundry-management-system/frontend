import { AppShell, Burger, Group, NavLink, Text, Title, useMantineColorScheme } from '@mantine/core'
import { LuLayoutDashboard, LuListTodo, LuLogOut, LuMoon, LuSun, LuUsers } from 'react-icons/lu'
import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout, ROLE_LABEL, type Role, useAuthStore } from '@/features/auth'
import { APP_NAME } from '@/shared/config/constants'
import { useUiStore } from '@/shared/store/uiStore'
import { IconButton } from '@/shared/ui'
import { queryClient } from '../providers/queryClient'

const navItems: { to: string; label: string; icon: typeof LuLayoutDashboard; roles: Role[] }[] = [
  { to: '/', label: 'Tổng quan', icon: LuLayoutDashboard, roles: ['ADMIN'] },
  { to: '/work-list', label: 'Danh sách công việc', icon: LuListTodo, roles: ['ADMIN', 'STAFF'] },
  { to: '/users', label: 'Nhân viên', icon: LuUsers, roles: ['ADMIN'] },
]

export function MainLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const roles = user?.roles ?? []

  const handleLogout = async () => {
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
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={!collapsed}
              onClick={toggleSidebar}
              size="sm"
              aria-label="Thu gọn menu"
            />
            <Title order={4}>{APP_NAME}</Title>
          </Group>
          <Group gap="xs">
            {user && (
              <Text size="sm">
                {user.username} ·{' '}
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
              end
              label={label}
              leftSection={<Icon size={18} />}
            />
          ))}
      </AppShell.Navbar>
      <AppShell.Main bg="var(--ds-surface)">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
