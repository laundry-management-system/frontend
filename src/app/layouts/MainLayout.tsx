import { AppShell, Burger, Group, NavLink, Title, useMantineColorScheme } from '@mantine/core'
import { LuLayoutDashboard, LuMoon, LuSun } from 'react-icons/lu'
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom'
import { APP_NAME } from '@/shared/config/constants'
import { useUiStore } from '@/shared/store/uiStore'
import { IconButton } from '@/shared/ui/IconButton'

const navItems = [{ to: '/', label: 'Tổng quan', icon: LuLayoutDashboard }]

export function MainLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

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
          <IconButton
            label={colorScheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            icon={colorScheme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
            onClick={toggleColorScheme}
          />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            component={RouterNavLink}
            to={to}
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
