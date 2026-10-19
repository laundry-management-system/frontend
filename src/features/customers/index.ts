export { useCustomers } from './application/useCustomers'
export { useCustomer } from './application/useCustomer'
export { useCustomerOrders, useCustomerStats } from './application/useCustomerOrders'
export {
  countOpenOrders,
  useChangeCustomerStatus,
  useCreateCustomer,
  useUpdateCustomer,
} from './application/useCustomerMutations'
export { formatPhone, looksLikePhone, normalizePhone } from './domain/rules'
export { CUSTOMER_STATUS_LABEL } from './domain/types'
export type { Customer, CustomerStats, CustomerStatus } from './domain/types'
export { CustomerCell, CustomerStatusText } from './presentation/CustomerCell'
export { CustomerFormModal } from './presentation/CustomerFormModal'
export { CustomerInfoCard } from './presentation/CustomerInfoCard'
export { CustomerOrdersCard } from './presentation/CustomerOrdersCard'
