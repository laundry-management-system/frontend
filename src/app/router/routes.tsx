import { Center, Loader } from '@mantine/core'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))

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
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
