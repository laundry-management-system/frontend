import { Center, Loader } from '@mantine/core'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const DesignSystemPage = lazy(() => import('@/pages/design-system/DesignSystemPage'))

const fallback = (
  <Center h="60vh">
    <Loader />
  </Center>
)

// Khi có module auth: thêm route /login trong AuthLayout và bọc MainLayout bằng <ProtectedRoute />
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={fallback}>
            <DashboardPage />
          </Suspense>
        ),
      },
      // Trang demo Laundry DS, chỉ có ở dev
      ...(import.meta.env.DEV
        ? [
            {
              path: '/dev/design-system',
              element: (
                <Suspense fallback={fallback}>
                  <DesignSystemPage />
                </Suspense>
              ),
            },
          ]
        : []),
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
