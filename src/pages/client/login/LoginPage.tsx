import { type Location, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell, type AuthPhoto, LoginForm } from '@/features/client/customer-account'
import { PATHS } from '@/shared/common/config/paths'

const PHOTO: AuthPhoto = {
  src: '/landing/hero-tiem-giat.jpg',
  alt: 'Dãy máy giặt cửa trước trong một tiệm giặt',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: Location } | null)?.from
  const handleSuccess = () =>
    navigate(from ? `${from.pathname}${from.search}${from.hash}` : PATHS.customerAccount, {
      replace: true,
    })

  return (
    <AuthShell
      eyebrow="Tài khoản khách"
      title="Đăng nhập"
      lead="Xem đơn đang giặt, đơn đã giao và cập nhật thông tin liên hệ của bạn."
      photo={PHOTO}
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthShell>
  )
}
