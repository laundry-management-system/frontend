import { Badge, Group, NavLink } from '@mantine/core'
import { useState } from 'react'
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/admin/auth'
import { useIncidentStats } from '@/features/admin/incidents'
import { canSeeModule, type NavModule, NAV_MODULES, visibleMenuItems } from '../router/modules'

// Trang chi tiết (VD /order-management/orders/12) vẫn sáng mục cha; riêng '/' phải khớp đúng
const isUnder = (pathname: string, path: string) =>
  path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)

const useRoles = () => useAuthStore((s) => s.user?.roles) ?? []

function IncidentBadge() {
  const pending = useIncidentStats().data?.pending ?? 0
  if (pending === 0) return null
  return (
    <Badge size="sm" circle color="warning">
      {pending}
    </Badge>
  )
}

/** Module có trang con: mở/đóng độc lập; tự mở khi người dùng đi tới một trang của nó. */
function ModuleNavLink({ module }: { module: NavModule }) {
  const { pathname } = useLocation()
  const roles = useRoles()
  const isActive = !!module.path && isUnder(pathname, module.path)
  const [opened, setOpened] = useState(isActive)
  // Vừa đi vào module (bấm link, Back) → mở ra; chỉnh state ngay trong render, không dùng effect
  const [wasActive, setWasActive] = useState(isActive)
  if (isActive !== wasActive) {
    setWasActive(isActive)
    if (isActive) setOpened(true)
  }

  const Icon = module.icon
  const items = visibleMenuItems(module, roles)
  const hasIncidents = items.some((c) => c.badge === 'incidents')
  const toggle = () => setOpened((o) => !o)
  // Huy hiệu đặt cạnh nhãn vì rightSection của NavLink cha là mũi tên mở/đóng
  const label = (
    <Group gap={6} wrap="nowrap">
      {module.label}
      {!opened && hasIncidents && <IncidentBadge />}
    </Group>
  )

  return (
    <NavLink
      label={label}
      leftSection={<Icon size={18} />}
      opened={opened}
      onChange={toggle}
      active={!opened && isActive}
      variant="subtle"
      childrenOffset={28}
    >
      {items.map((c) => (
        <NavLink
          key={c.path}
          component={RouterNavLink}
          to={c.path}
          label={c.label}
          active={isUnder(pathname, c.path)}
          rightSection={c.badge === 'incidents' ? <IncidentBadge /> : null}
        />
      ))}
    </NavLink>
  )
}

/** Menu 2 cấp: module → trang con, lọc theo vai trò. */
export function SidebarNav() {
  const roles = useRoles()
  return (
    <>
      {NAV_MODULES.filter((m) => canSeeModule(m, roles)).map((m) => {
        if (!m.route) return <ModuleNavLink key={m.key} module={m} />
        const Icon = m.icon
        return (
          <NavLink
            key={m.key}
            component={RouterNavLink}
            to={m.route.path}
            end={m.route.path === '/'}
            label={m.label}
            leftSection={<Icon size={18} />}
          />
        )
      })}
    </>
  )
}
