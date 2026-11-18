import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import { type TabDef, TabbedPage } from '@/shared/admin/ui'
import PriceHistoryPage from './PriceHistoryPage'
import ServicesPage from './ServicesPage'

const PRICES_TAB: TabDef = { value: 'prices', label: 'Bảng giá', content: <ServicesPage /> }
const HISTORY_TAB: TabDef = {
  value: 'history',
  label: 'Lịch sử đổi giá',
  content: <PriceHistoryPage />,
}

export default function ServiceTabsPage() {
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const tabs = isAdmin ? [PRICES_TAB, HISTORY_TAB] : [PRICES_TAB]
  return <TabbedPage tabs={tabs} />
}
