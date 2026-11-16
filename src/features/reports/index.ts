export { useDailyRevenue } from './application/useDailyRevenue'
export { useDashboard } from './application/useDashboard'
export { useOrderReport } from './application/useOrderReport'
export { useRevenueReport } from './application/useRevenueReport'
export { delta, paymentShare, presetRange } from './domain/dashboard'
export {
  avgOrderValue,
  csvFileName,
  growthPct,
  parsePeriod,
  periodBounds,
  periodLabel,
  pieSlices,
  revenueCsvRows,
  serviceCsvRows,
  serviceShare,
  validatePeriod,
} from './domain/report'
export type {
  Dashboard,
  DashboardPreset,
  DateRange,
  OrderReport,
  ReportMode,
  ReportPeriod,
  RevenueReport,
  RevenueRow,
  ServiceRow,
} from './domain/types'
export { OrdersLine } from './presentation/OrdersLine'
export { PaymentSplit } from './presentation/PaymentSplit'
export { ReportPeriodPicker } from './presentation/ReportPeriodPicker'
export { RevenueBars } from './presentation/RevenueBars'
export { ServiceShareRing } from './presentation/ServiceShareRing'
