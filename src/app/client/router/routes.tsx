import { Navigate, useLocation, type RouteObject } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import {
  CustomerAccountRoute,
  CustomerBookingRoute,
  CustomerForgotPasswordRoute,
  CustomerLoginRoute,
  CustomerOrderDetailRoute,
  CustomerRegisterRoute,
  CustomerResetPasswordRoute,
} from './CustomerPages'
import { PublicLanding } from './PublicLanding'

function LegacyRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation()
  return <Navigate replace to={{ pathname: to, search, hash }} />
}

export const clientRoutes: RouteObject[] = [
  { path: PATHS.legacyLanding, element: <LegacyRedirect to={PATHS.landing} /> },
  { path: PATHS.legacyBooking, element: <LegacyRedirect to={PATHS.customerBooking} /> },
  { path: PATHS.landing, element: <PublicLanding /> },
  { path: PATHS.customerLogin, element: <CustomerLoginRoute /> },
  { path: PATHS.customerRegister, element: <CustomerRegisterRoute /> },
  { path: PATHS.customerForgotPassword, element: <CustomerForgotPasswordRoute /> },
  { path: PATHS.customerResetPassword, element: <CustomerResetPasswordRoute /> },
  { path: PATHS.customerAccount, element: <CustomerAccountRoute /> },
  { path: PATHS.customerOrderDetail(':orderCode'), element: <CustomerOrderDetailRoute /> },
  { path: PATHS.customerBooking, element: <CustomerBookingRoute /> },
]
