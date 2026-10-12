import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core'
import { MdDashboard } from 'react-icons/md'
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom'
import { APP_NAME } from '@/shared/config/constants'
import { useUiStore } from '@/shared/store/uiStore'

const navItems = [{ to: '/', label: 'Tổng quan', icon: MdDashboard }]

export function MainLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: collapsed, desktop: collapsed },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={!collapsed} onClick={toggleSidebar} size="sm" aria-label="Thu gọn menu" />
          <Title order={4}>{APP_NAME}</Title>
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
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
