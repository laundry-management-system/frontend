import { AppShell, Burger, Button, Group, Text, Title, useMantineColorScheme } from '@mantine/core'
import { useState } from 'react'
import { LuLockOpen, LuLogOut, LuMoon, LuSun } from 'react-icons/lu'
import { Outlet, useNavigate } from 'react-router-dom'
import { logout, ROLE_LABEL, useAuthStore } from '@/features/admin/auth'
import { CurrentShiftCard, OpenShiftModal, useCurrentShift } from '@/features/admin/shifts'
import { useMe } from '@/features/admin/users'
import { APP_NAME } from '@/shared/admin/config/constants'
import { PATHS } from '@/shared/common/config/paths'
import { useUiStore } from '@/shared/admin/store/uiStore'
import { IconButton } from '@/shared/admin/ui'
import { queryClient } from '@/shared/common/api/queryClient'
import { SidebarNav } from './SidebarNav'

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
  const goCloseShift = () => currentShift && navigate(PATHS.shiftClose(currentShift.id))

  const closeShiftPrompt = () => {
    writeShiftPrompted(true)
    setShiftPrompted(true)
    setOpenShiftRequested(false)
  }

  const handleLogout = async () => {
    writeShiftPrompted(false)
    await logout()
    queryClient.clear()
    navigate(PATHS.login, { replace: true })
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
        <SidebarNav />
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
