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
  ChannelRow,
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
export { BANK_COLOR, CASH_COLOR } from './presentation/paymentColors'
export { RevenueDonut, type DonutSlice } from './presentation/RevenueDonut'
export { ChannelBreakdown } from './presentation/ChannelBreakdown'
export { OrdersLine } from './presentation/OrdersLine'
export { PaymentSplit } from './presentation/PaymentSplit'
export { ReportPeriodPicker } from './presentation/ReportPeriodPicker'
export { RevenueBars, type BarSeries } from './presentation/RevenueBars'
export { ServiceShareRing } from './presentation/ServiceShareRing'
