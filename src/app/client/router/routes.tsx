import type { RouteObject } from 'react-router-dom'
import { PATHS } from '@/shared/common/config/paths'
import { PublicLanding } from './PublicLanding'

export const clientRoutes: RouteObject[] = [{ path: PATHS.landing, element: <PublicLanding /> }]
