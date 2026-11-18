import { Center, Loader } from '@mantine/core'
import { lazy, type ReactNode, Suspense } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { LegacyRedirect } from './LegacyRedirect'
import { LEGACY_REDIRECTS, NAV_MODULES } from './modules'
import { ModuleIndex } from './ModuleIndex'
import { RoleGuard } from './RoleGuard'
import { PATHS } from '@/shared/common/config/paths'

const DesignSystemPage = lazy(() => import('@/pages/admin/design-system/DesignSystemPage'))
const LoginPage = lazy(() => import('@/pages/admin/login/LoginPage'))
const SetupPasswordPage = lazy(() => import('@/pages/admin/setup-password/SetupPasswordPage'))

const fallback = (
  <Center h="60vh">
    <Loader />
  </Center>
)

const page = (node: ReactNode) => <Suspense fallback={fallback}>{node}</Suspense>

/** Route khu quản trị; `landing` là trang khách thấy ở `/` khi chưa đăng nhập, do router gốc truyền vào. */
export const adminRoutes = (landing: ReactNode): RouteObject[] => [
  {
    element: <GuestRoute />,
    children: [
      { element: <AuthLayout />, children: [{ path: PATHS.login, element: page(<LoginPage />) }] },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/setup-password', element: page(<SetupPasswordPage />) }],
  },
  {
    element: <ProtectedRoute landing={landing} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          ...NAV_MODULES.flatMap((m) => [m.route, ...(m.children ?? [])])
            .filter((r) => r !== undefined)
            .map((r) => ({
              element: <RoleGuard roles={r.roles} />,
              children: [{ path: r.path, element: page(r.element) }],
            })),
          ...NAV_MODULES.flatMap((m) =>
            m.path ? [{ path: m.path, element: <ModuleIndex module={m} /> }] : [],
          ),
          // Trang đích tự kiểm quyền nên chuyển hướng không cần RoleGuard
          ...LEGACY_REDIRECTS.map((r) => ({ path: r.from, element: <LegacyRedirect to={r.to} /> })),
          // Trang demo Laundry DS, chỉ có ở dev
          ...(import.meta.env.DEV
            ? [{ path: '/dev/design-system', element: page(<DesignSystemPage />) }]
            : []),
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
