import { createBrowserRouter } from 'react-router-dom'
import { adminRoutes } from './admin/router/routes'
import { PublicLanding } from './client/router/PublicLanding'
import { clientRoutes } from './client/router/routes'

export const router = createBrowserRouter([...clientRoutes, ...adminRoutes(<PublicLanding />)])
