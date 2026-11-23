export type ServiceUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'

export type ServiceStatus = 'ACTIVE' | 'INACTIVE'

export interface WashMode {
  id: number
  code: string
  name: string
  completionHours: number
  active: boolean
  isDefault: boolean
}

export interface ServicePrice {
  washModeId: number
  price: number
}

export interface ModeServiceLine {
  serviceId: number
  price: number
}

export type WashModeDetail = WashMode & { services: ModeServiceLine[] }

export type WashModeRequest = Omit<WashMode, 'id' | 'code'> & { services: ModeServiceLine[] }

export interface Service {
  id: number
  code: string
  name: string
  unit: ServiceUnit | null
  minQuantity: number
  whitesApplicable: boolean
  status: ServiceStatus
  prices: ServicePrice[]
}

/** Một dòng hình thức đang hoạt động trên form dịch vụ; `''` là giá trị rỗng của NumberInput */
export interface ServiceFormPrice {
  mode: WashMode
  enabled: boolean
  price: number | ''
}

export interface ServiceFormValues {
  name: string
  unit: ServiceUnit | null
  prices: ServiceFormPrice[]
  minQuantity: number | ''
  whitesApplicable: boolean
  status: ServiceStatus
}

export const UNIT_LABEL: Record<ServiceUnit, string> = {
  KG: 'kg',
  PIECE: 'món',
  SET: 'bộ',
  PRODUCT: 'sản phẩm',
}

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
}

/** Trường của dịch vụ được ghi vào lịch sử thay đổi giá (BR-C02) */
export type PriceField =
  'PRICE' | 'MODE_PRICE' | 'EXPRESS_SURCHARGE' | 'STANDARD_HOURS' | 'EXPRESS_HOURS' | 'STATUS'

export const PRICE_FIELDS: readonly PriceField[] = [
  'PRICE',
  'MODE_PRICE',
  'EXPRESS_SURCHARGE',
  'STANDARD_HOURS',
  'EXPRESS_HOURS',
  'STATUS',
]

export const PRICE_FIELD_LABEL: Record<PriceField, string> = {
  PRICE: 'Đơn giá',
  MODE_PRICE: 'Giá theo hình thức',
  EXPRESS_SURCHARGE: 'Phụ phí giặt nhanh',
  STANDARD_HOURS: 'Thời gian xử lý',
  EXPRESS_HOURS: 'Thời gian giặt nhanh',
  STATUS: 'Trạng thái',
}

/** Một trường đã đổi trong một lần lưu; `null` = không có giá trị (giặt nhanh bị tắt) */
export interface PriceHistoryRow {
  logId: number
  changedAt: string
  serviceId: number
  serviceCode: string | null
  serviceName: string
  unit: ServiceUnit | null
  field: PriceField
  washModeId: number | null
  washModeName: string | null
  oldValue: string | null
  newValue: string | null
  changedById: number
  changedByName: string
  reason: string
}

export interface PriceIssued {
  effectiveFrom: string | null
  issuedBy: string | null
}

/** `from`/`to` là ngày VN dạng YYYY-MM-DD */
export interface PriceHistoryFilter {
  serviceId?: number
  userId?: number
  field?: PriceField
  from?: string
  to?: string
  page: number
  size: number
}
