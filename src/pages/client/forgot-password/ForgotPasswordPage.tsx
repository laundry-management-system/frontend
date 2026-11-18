import { AuthShell, type AuthPhoto, ForgotPasswordForm } from '@/features/client/customer-account'
import { usePublicStore } from '@/features/client/public-site'

const PHOTO: AuthPhoto = {
  src: '/landing/cam-ket-phoi-do.jpg',
  alt: 'Quần áo sạch phơi trên giá',
}

export default function ForgotPasswordPage() {
  const { data: store } = usePublicStore()

  return (
    <AuthShell
      eyebrow="Tài khoản khách"
      title="Quên mật khẩu"
      lead="Nhập email đã gắn với tài khoản, tiệm gửi link đặt lại trong vài phút."
      photo={PHOTO}
    >
      <ForgotPasswordForm storePhone={store?.phone ?? undefined} />
    </AuthShell>
  )
}
