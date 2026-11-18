import { lazy, Suspense } from 'react'
import { PublicLayout } from '../layouts/PublicLayout'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))

/** Landing công khai trong khung riêng; khung hiện ngay, nội dung trang tải sau. */
export function PublicLanding() {
  return (
    <PublicLayout>
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    </PublicLayout>
  )
}
