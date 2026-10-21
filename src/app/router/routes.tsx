import { Center, Loader } from '@mantine/core'
import { lazy, type ReactNode, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'

const CustomerDetailPage = lazy(() => import('@/pages/customers/CustomerDetailPage'))
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const DesignSystemPage = lazy(() => import('@/pages/design-system/DesignSystemPage'))
const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const ServicesPage = lazy(() => import('@/pages/services/ServicesPage'))
const SetupPasswordPage = lazy(() => import('@/pages/setup-password/SetupPasswordPage'))
const WorkListPage = lazy(() => import('@/pages/work-list/WorkListPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))

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
            ],
          },
          { path: '/work-list', element: page(<WorkListPage />) },
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
