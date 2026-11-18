import {
  ChangePasswordSection,
  MyOrdersSection,
  ProfileSection,
} from '@/features/client/customer-account'

export default function AccountPage() {
  return (
    <div className="pub-container flex flex-col gap-6 py-12 md:py-20">
      <h1 className="text-(length:--pub-text-2xl)">Tài khoản của tôi</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[26rem_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileSection />
          <ChangePasswordSection />
        </div>
        <MyOrdersSection />
      </div>
    </div>
  )
}
