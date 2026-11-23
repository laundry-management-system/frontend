import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import { WashModesTab } from '@/features/admin/services'
import { ServiceAreasTab } from '@/features/admin/settings'
import { type TabDef, TabbedPage } from '@/shared/admin/ui'
import PriceHistoryPage from './PriceHistoryPage'
import ServicesPage from './ServicesPage'

const PRICES_TAB: TabDef = { value: 'prices', label: 'Bảng giá', content: <ServicesPage /> }
const MODES_TAB: TabDef = {
  value: 'wash-modes',
  label: 'Hình thức giặt',
  content: <WashModesTab />,
}
const AREAS_TAB: TabDef = {
  value: 'service-areas',
  label: 'Khu vực giao nhận',
  content: <ServiceAreasTab />,
}
const HISTORY_TAB: TabDef = {
  value: 'history',
  label: 'Lịch sử đổi giá',
  content: <PriceHistoryPage />,
}

export default function ServiceTabsPage() {
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const tabs = isAdmin ? [PRICES_TAB, MODES_TAB, AREAS_TAB, HISTORY_TAB] : [PRICES_TAB, MODES_TAB]
  return <TabbedPage tabs={tabs} />
}
