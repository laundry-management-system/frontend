import { useSearchParams } from 'react-router-dom'
import { AuthShell, type AuthPhoto, ResetPasswordForm } from '@/features/client/customer-account'

const PHOTO: AuthPhoto = {
  src: '/landing/hero-tiem-giat.jpg',
  alt: 'Dãy máy giặt cửa trước trong một tiệm giặt',
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams()

  return (
    <AuthShell
      eyebrow="Tài khoản khách"
      title="Đặt lại mật khẩu"
      lead="Mật khẩu mới tối thiểu 8 ký tự, gồm cả chữ và số."
      photo={PHOTO}
    >
      <ResetPasswordForm token={params.get('token')} />
    </AuthShell>
  )
}
