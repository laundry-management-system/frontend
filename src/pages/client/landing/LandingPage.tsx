import { formatPhone } from '@/shared/common/lib/format'
import {
  Commitments,
  Estimator,
  Faq,
  FinalCta,
  Hero,
  HowItWorks,
  PriceList,
  QuickFacts,
  ServiceAreas,
  usePublicStore,
} from '@/features/client/public-site'

/** Landing công khai: nơi duy nhất quyết định thứ tự các section. */
export default function LandingPage() {
  const { data: store } = usePublicStore()

  // Phần nào chưa nhập thì bỏ cả câu, giống thẻ meta trong HTML ban đầu
  const description = store
    ? [
        store.name,
        store.address,
        store.phone && `Gọi ${formatPhone(store.phone)}`,
        `Mở cửa ${store.openingTime}–${store.closingTime} mỗi ngày`,
      ]
        .filter(Boolean)
        .join('. ') + '.'
    : null

  return (
    <>
      {store && <title>{`${store.name} – Giặt sấy, giặt ủi`}</title>}
      {description && <meta name="description" content={description} />}
      <Hero />
      <QuickFacts />
      <PriceList />
      <HowItWorks />
      <ServiceAreas />
      <Estimator />
      <Commitments />
      <Faq />
      <FinalCta />
    </>
  )
}
