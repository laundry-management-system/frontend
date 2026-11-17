type Id = number | string

/** Tiền tố URL của từng module trên menu (mục đơn như Tổng quan, Khách hàng không có tiền tố). */
export const MODULE_PATHS = {
  operations: '/operations',
  orderManagement: '/order-management',
  catalog: '/catalog',
  finance: '/finance',
  admin: '/admin',
} as const

const M = MODULE_PATHS

/** Mọi đường dẫn trong app; đổi URL chỉ sửa ở đây. */
export const PATHS = {
  dashboard: '/',
  login: '/login',

  workList: `${M.operations}/work-list`,
  intake: `${M.operations}/intake`,
  intakeDone: (orderId: Id) => `${M.operations}/intake/${orderId}/done`,
  classify: `${M.operations}/classify`,
  machines: `${M.operations}/machines`,

  orders: `${M.orderManagement}/orders`,
  ordersStored: `${M.orderManagement}/orders?tab=stored`,
  orderDetail: (id: Id) => `${M.orderManagement}/orders/${id}`,
  incidents: `${M.orderManagement}/incidents`,
  incidentNew: `${M.orderManagement}/incidents/new`,
  incidentDetail: (id: Id) => `${M.orderManagement}/incidents/${id}`,

  customers: '/customers',
  customerDetail: (id: Id) => `/customers/${id}`,

  services: `${M.catalog}/services`,
  vouchers: `${M.catalog}/vouchers`,

  shifts: `${M.finance}/shifts`,
  shiftDetail: (id: Id) => `${M.finance}/shifts/${id}`,
  shiftClose: (id: Id) => `${M.finance}/shifts/${id}/close`,
  reports: `${M.finance}/reports`,

  users: `${M.admin}/users`,
  auditLog: `${M.admin}/audit-log`,
  settings: `${M.admin}/settings`,
} as const
