import type { RouteObject } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import {
  CustomerAccountRoute,
  CustomerForgotPasswordRoute,
  CustomerLoginRoute,
  CustomerRegisterRoute,
  CustomerResetPasswordRoute,
} from './CustomerPages'
import { PublicLanding } from './PublicLanding'

export const clientRoutes: RouteObject[] = [
  { path: PATHS.landing, element: <PublicLanding /> },
  { path: PATHS.customerLogin, element: <CustomerLoginRoute /> },
  { path: PATHS.customerRegister, element: <CustomerRegisterRoute /> },
  { path: PATHS.customerForgotPassword, element: <CustomerForgotPasswordRoute /> },
  { path: PATHS.customerResetPassword, element: <CustomerResetPasswordRoute /> },
  { path: PATHS.customerAccount, element: <CustomerAccountRoute /> },
]
