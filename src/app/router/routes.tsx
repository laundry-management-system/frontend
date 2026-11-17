import { Center, Loader } from '@mantine/core'
import { lazy, type ReactNode, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'

const AuditLogPage = lazy(() => import('@/pages/audit-log/AuditLogPage'))
const ClassifyPage = lazy(() => import('@/pages/classify/ClassifyPage'))
const ShiftReconcilePage = lazy(() => import('@/pages/shifts/ShiftReconcilePage'))
const ShiftsPage = lazy(() => import('@/pages/shifts/ShiftsPage'))
const CustomerDetailPage = lazy(() => import('@/pages/customers/CustomerDetailPage'))
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const DesignSystemPage = lazy(() => import('@/pages/design-system/DesignSystemPage'))
const IntakeDonePage = lazy(() => import('@/pages/intake/IntakeDonePage'))
const IntakePage = lazy(() => import('@/pages/intake/IntakePage'))
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'))
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'))
const OrderReportPage = lazy(() => import('@/pages/reports/OrderReportPage'))
const RevenueReportPage = lazy(() => import('@/pages/reports/RevenueReportPage'))
const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const ServicesPage = lazy(() => import('@/pages/services/ServicesPage'))
const MachinesPage = lazy(() => import('@/pages/machines/MachinesPage'))
const StoredOrdersPage = lazy(() => import('@/pages/stored-orders/StoredOrdersPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const SetupPasswordPage = lazy(() => import('@/pages/setup-password/SetupPasswordPage'))
const WorkListPage = lazy(() => import('@/pages/work-list/WorkListPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
const VouchersPage = lazy(() => import('@/pages/vouchers/VouchersPage'))

const fallback = (
  <Center h="60vh">
    <Loader />
  </Center>
)

const page = (node: ReactNode) => <Suspense fallback={fallback}>{node}</Suspense>

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { element: <AuthLayout />, children: [{ path: '/login', element: page(<LoginPage />) }] },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/setup-password', element: page(<SetupPasswordPage />) }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            element: <RoleGuard roles={['ADMIN']} />,
            children: [
              { path: '/', element: page(<DashboardPage />) },
              { path: '/users', element: page(<UsersPage />) },
              { path: '/audit-log', element: page(<AuditLogPage />) },
              { path: '/reports/revenue', element: page(<RevenueReportPage />) },
              { path: '/reports/orders', element: page(<OrderReportPage />) },
              { path: '/shifts', element: page(<ShiftsPage />) },
              { path: '/shifts/:id', element: page(<ShiftReconcilePage mode="approve" />) },
              { path: '/settings', element: page(<SettingsPage />) },
              { path: '/vouchers', element: page(<VouchersPage />) },
            ],
          },
          { path: '/work-list', element: page(<WorkListPage />) },
          { path: '/shifts/:id/close', element: page(<ShiftReconcilePage mode="close" />) },
          { path: '/orders', element: page(<OrdersPage />) },
          { path: '/orders/:id', element: page(<OrderDetailPage />) },
          { path: '/stored-orders', element: page(<StoredOrdersPage />) },
          { path: '/machines', element: page(<MachinesPage />) },
          { path: '/intake', element: page(<IntakePage />) },
          { path: '/intake/:orderId/done', element: page(<IntakeDonePage />) },
          { path: '/classify', element: page(<ClassifyPage />) },
          { path: '/customers', element: page(<CustomersPage />) },
          { path: '/customers/:id', element: page(<CustomerDetailPage />) },
          { path: '/services', element: page(<ServicesPage />) },
          // Trang demo Laundry DS, chỉ có ở dev
          ...(import.meta.env.DEV
            ? [{ path: '/dev/design-system', element: page(<DesignSystemPage />) }]
            : []),
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
