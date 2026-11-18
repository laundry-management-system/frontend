import StoredOrdersPage from './StoredOrdersPage'
import { type TabDef, TabbedPage } from '@/shared/admin/ui'
import OrdersPage from './OrdersPage'

const TABS: TabDef[] = [
  { value: 'all', label: 'Tất cả', content: <OrdersPage /> },
  { value: 'stored', label: 'Đồ tồn', content: <StoredOrdersPage /> },
]

export default function OrderTabsPage() {
  return <TabbedPage tabs={TABS} />
}
