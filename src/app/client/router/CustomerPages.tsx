import { lazy, Suspense, type ReactNode } from 'react'
import { PublicLayout } from '../layouts/PublicLayout'
import { CustomerGuestRoute } from './CustomerGuestRoute'
import { CustomerRoute } from './CustomerRoute'

const LoginPage = lazy(() => import('@/pages/client/login/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/client/register/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/client/forgot-password/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/client/reset-password/ResetPasswordPage'))
const AccountPage = lazy(() => import('@/pages/client/account/AccountPage'))

function Shell({ children }: { children: ReactNode }) {
  return (
    <PublicLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </PublicLayout>
  )
}

export function CustomerLoginRoute() {
  return (
    <Shell>
      <CustomerGuestRoute>
        <LoginPage />
      </CustomerGuestRoute>
    </Shell>
  )
}
export function CustomerRegisterRoute() {
  return (
    <Shell>
      <CustomerGuestRoute>
        <RegisterPage />
      </CustomerGuestRoute>
    </Shell>
  )
}
export function CustomerAccountRoute() {
  return (
    <Shell>
      <CustomerRoute>
        <AccountPage />
      </CustomerRoute>
    </Shell>
  )
}

export function CustomerForgotPasswordRoute() {
  return (
    <Shell>
      <CustomerGuestRoute>
        <ForgotPasswordPage />
      </CustomerGuestRoute>
    </Shell>
  )
}

export function CustomerResetPasswordRoute() {
  return (
    <Shell>
      <ResetPasswordPage />
    </Shell>
  )
}
