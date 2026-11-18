import { lazy, type ReactNode } from 'react'
import type { IconType } from 'react-icons'
import {
  LuChartColumn,
  LuContact,
  LuFileText,
  LuLayoutDashboard,
  LuListTodo,
  LuPackagePlus,
  LuPackageSearch,
  LuReceiptText,
  LuSettings,
  LuTags,
  LuTicketPercent,
  LuTriangleAlert,
  LuUsers,
  LuWallet,
  LuWashingMachine,
} from 'react-icons/lu'
import type { Role } from '@/features/admin/auth'
import { MODULE_PATHS, PATHS } from '@/shared/common/config/paths'

const AuditLogPage = lazy(() => import('@/pages/admin/audit-log/AuditLogPage'))
const ClassifyPage = lazy(() => import('@/pages/admin/classify/ClassifyPage'))
const ShiftReconcilePage = lazy(() => import('@/pages/admin/shifts/ShiftReconcilePage'))
const ShiftsPage = lazy(() => import('@/pages/admin/shifts/ShiftsPage'))
const CustomerDetailPage = lazy(() => import('@/pages/admin/customers/CustomerDetailPage'))
const CustomersPage = lazy(() => import('@/pages/admin/customers/CustomersPage'))
const DashboardPage = lazy(() => import('@/pages/admin/dashboard/DashboardPage'))
const IntakeDonePage = lazy(() => import('@/pages/admin/intake/IntakeDonePage'))
const IntakePage = lazy(() => import('@/pages/admin/intake/IntakePage'))
const OrderDetailPage = lazy(() => import('@/pages/admin/orders/OrderDetailPage'))
const OrderTabsPage = lazy(() => import('@/pages/admin/orders/OrderTabsPage'))
const ReportsPage = lazy(() => import('@/pages/admin/reports/ReportsPage'))
const ServiceTabsPage = lazy(() => import('@/pages/admin/services/ServiceTabsPage'))
const MachinesPage = lazy(() => import('@/pages/admin/machines/MachinesPage'))
const SettingsPage = lazy(() => import('@/pages/admin/settings/SettingsPage'))
const WorkListPage = lazy(() => import('@/pages/admin/work-list/WorkListPage'))
const UsersPage = lazy(() => import('@/pages/admin/users/UsersPage'))
const VouchersPage = lazy(() => import('@/pages/admin/vouchers/VouchersPage'))
const IncidentsPage = lazy(() => import('@/pages/admin/incidents/IncidentsPage'))
const IncidentDetailPage = lazy(() => import('@/pages/admin/incidents/IncidentDetailPage'))

const ALL: Role[] = ['ADMIN', 'STAFF']
const ADMIN: Role[] = ['ADMIN']

export interface NavRoute {
  path: string
  label?: string
  icon?: IconType
  roles: Role[]
  /** Vai trò thấy mục trên menu, khi khác `roles` (Tạo đơn / Phân loại chỉ hiện cho nhân viên) */
  menuRoles?: Role[]
  element: ReactNode
  hideInMenu?: boolean
  badge?: 'incidents' | 'registrations'
}

export interface NavModule {
  key: string
  label: string
  icon: IconType
  /** Tiền tố URL; mục đơn (không có `children`) dùng `route` */
  path?: string
  route?: NavRoute
  children?: NavRoute[]
}

export const NAV_MODULES: NavModule[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    icon: LuLayoutDashboard,
    route: { path: PATHS.dashboard, roles: ADMIN, element: <DashboardPage /> },
  },
  {
    key: 'operations',
    label: 'Vận hành',
    icon: LuListTodo,
    path: MODULE_PATHS.operations,
    children: [
      {
        path: PATHS.workList,
        label: 'Danh sách công việc',
        icon: LuListTodo,
        roles: ALL,
        element: <WorkListPage />,
      },
      {
        path: PATHS.intake,
        label: 'Tạo đơn',
        icon: LuPackagePlus,
        roles: ALL,
        menuRoles: ['STAFF'],
        element: <IntakePage />,
      },
      {
        path: PATHS.intakeDone(':orderId'),
        roles: ALL,
        element: <IntakeDonePage />,
        hideInMenu: true,
      },
      {
        path: PATHS.classify,
        label: 'Phân loại đồ',
        icon: LuPackageSearch,
        roles: ALL,
        menuRoles: ['STAFF'],
        element: <ClassifyPage />,
      },
      {
        path: PATHS.machines,
        label: 'Máy giặt & sấy',
        icon: LuWashingMachine,
        roles: ALL,
        element: <MachinesPage />,
      },
    ],
  },
  {
    key: 'order-management',
    label: 'Đơn hàng',
    icon: LuReceiptText,
    path: MODULE_PATHS.orderManagement,
    children: [
      {
        path: PATHS.orders,
        label: 'Đơn hàng',
        icon: LuReceiptText,
        roles: ALL,
        element: <OrderTabsPage />,
      },
      {
        path: PATHS.orderDetail(':id'),
        roles: ALL,
        element: <OrderDetailPage />,
        hideInMenu: true,
      },
      {
        path: PATHS.incidents,
        label: 'Sự cố & bồi thường',
        icon: LuTriangleAlert,
        roles: ALL,
        element: <IncidentsPage />,
        badge: 'incidents',
      },
      { path: PATHS.incidentNew, roles: ALL, element: <IncidentDetailPage />, hideInMenu: true },
      {
        path: PATHS.incidentDetail(':id'),
        roles: ALL,
        element: <IncidentDetailPage />,
        hideInMenu: true,
      },
    ],
  },
  {
    key: 'customers',
    label: 'Khách hàng',
    icon: LuContact,
    route: {
      path: PATHS.customers,
      roles: ALL,
      element: <CustomersPage />,
      badge: 'registrations',
    },
    children: [
      {
        path: PATHS.customerDetail(':id'),
        roles: ALL,
        element: <CustomerDetailPage />,
        hideInMenu: true,
      },
    ],
  },
  {
    key: 'catalog',
    label: 'Dịch vụ & khuyến mãi',
    icon: LuTags,
    path: MODULE_PATHS.catalog,
    children: [
      {
        path: PATHS.services,
        label: 'Bảng giá dịch vụ',
        icon: LuTags,
        roles: ALL,
        element: <ServiceTabsPage />,
      },
      {
        path: PATHS.vouchers,
        label: 'Voucher',
        icon: LuTicketPercent,
        roles: ADMIN,
        element: <VouchersPage />,
      },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính & báo cáo',
    icon: LuChartColumn,
    path: MODULE_PATHS.finance,
    children: [
      {
        path: PATHS.shifts,
        label: 'Ca làm việc',
        icon: LuWallet,
        roles: ADMIN,
        element: <ShiftsPage />,
      },
      {
        path: PATHS.shiftDetail(':id'),
        roles: ADMIN,
        element: <ShiftReconcilePage mode="approve" />,
        hideInMenu: true,
      },
      // Người mở ca (kể cả nhân viên) tự kết ca
      {
        path: PATHS.shiftClose(':id'),
        roles: ALL,
        element: <ShiftReconcilePage mode="close" />,
        hideInMenu: true,
      },
      {
        path: PATHS.reports,
        label: 'Báo cáo',
        icon: LuChartColumn,
        roles: ADMIN,
        element: <ReportsPage />,
      },
    ],
  },
  {
    key: 'admin',
    label: 'Quản trị hệ thống',
    icon: LuSettings,
    path: MODULE_PATHS.admin,
    children: [
      {
        path: PATHS.users,
        label: 'Nhân viên',
        icon: LuUsers,
        roles: ADMIN,
        element: <UsersPage />,
      },
      {
        path: PATHS.auditLog,
        label: 'Nhật ký hệ thống',
        icon: LuFileText,
        roles: ADMIN,
        element: <AuditLogPage />,
      },
      {
        path: PATHS.settings,
        label: 'Cài đặt cửa hàng',
        icon: LuSettings,
        roles: ADMIN,
        element: <SettingsPage />,
      },
    ],
  },
]

const allowed = (roles: Role[], userRoles: Role[]) => roles.some((r) => userRoles.includes(r))

/** Mục menu người dùng được thấy của một module (không gồm trang chi tiết). */
export const visibleMenuItems = (m: NavModule, userRoles: Role[]) =>
  (m.children ?? []).filter((c) => !c.hideInMenu && allowed(c.menuRoles ?? c.roles, userRoles))

export const canSeeModule = (m: NavModule, userRoles: Role[]) =>
  m.route ? allowed(m.route.roles, userRoles) : visibleMenuItems(m, userRoles).length > 0

/** Trang con đầu tiên người dùng được vào, dùng cho URL chỉ có tiền tố module. */
export const firstAllowedPath = (m: NavModule, userRoles: Role[]) =>
  (m.children ?? []).find((c) => !c.hideInMenu && allowed(c.roles, userRoles))?.path

type Params = Record<string, string | undefined>

/** URL trước khi chia module; giữ để bookmark / link cũ vẫn mở đúng trang. */
export const LEGACY_REDIRECTS: { from: string; to: (p: Params) => string }[] = [
  { from: '/work-list', to: () => PATHS.workList },
  { from: '/intake', to: () => PATHS.intake },
  { from: '/intake/:orderId/done', to: (p) => PATHS.intakeDone(p.orderId!) },
  { from: '/classify', to: () => PATHS.classify },
  { from: '/machines', to: () => PATHS.machines },
  { from: '/orders', to: () => `${PATHS.orders}?tab=all` },
  { from: '/orders/:id', to: (p) => PATHS.orderDetail(p.id!) },
  { from: '/stored-orders', to: () => PATHS.ordersStored },
  { from: '/incidents', to: () => PATHS.incidents },
  { from: '/incidents/new', to: () => PATHS.incidentNew },
  { from: '/incidents/:id', to: (p) => PATHS.incidentDetail(p.id!) },
  { from: '/services', to: () => `${PATHS.services}?tab=prices` },
  { from: '/services/price-history', to: () => `${PATHS.services}?tab=history` },
  { from: '/vouchers', to: () => PATHS.vouchers },
  { from: '/shifts', to: () => PATHS.shifts },
  { from: '/shifts/:id', to: (p) => PATHS.shiftDetail(p.id!) },
  { from: '/shifts/:id/close', to: (p) => PATHS.shiftClose(p.id!) },
  { from: '/reports/revenue', to: () => `${PATHS.reports}?tab=revenue` },
  { from: '/reports/orders', to: () => `${PATHS.reports}?tab=orders` },
  { from: '/users', to: () => PATHS.users },
  { from: '/audit-log', to: () => PATHS.auditLog },
  { from: '/settings', to: () => PATHS.settings },
]
