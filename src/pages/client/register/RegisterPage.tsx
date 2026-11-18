import { AuthShell, type AuthPhoto, RegisterForm } from '@/features/client/customer-account'
import { usePublicStore } from '@/features/client/public-site'

const PHOTO: AuthPhoto = {
  src: '/landing/cam-ket-phoi-do.jpg',
  alt: 'Quần áo sạch phơi trên giá',
}

export default function RegisterPage() {
  const { data: store } = usePublicStore()

  return (
    <AuthShell
      eyebrow="Tài khoản khách"
      title="Tạo tài khoản"
      lead="Tiệm gọi xác nhận số điện thoại rồi kích hoạt, sau đó bạn xem được mọi đơn đã gửi."
      photo={PHOTO}
    >
      <RegisterForm storePhone={store?.phone ?? undefined} />
    </AuthShell>
  )
}
