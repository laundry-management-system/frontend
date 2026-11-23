export interface BookingSettings {
  bookingEnabled: boolean
  deliveryEnabled: boolean
  minLeadHours: number
  returnGapHoursNormal: number
  returnGapHoursExpress: number
}

export type DropoffMethod = 'AT_STORE' | 'PICKUP'
export type ReturnMethod = 'AT_STORE' | 'DELIVERY'
export type BookingUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'
export type OrderType = 'NORMAL' | 'EXPRESS'

export interface BookingItemDraft {
  serviceId: number
}

export interface BookingDraft {
  /** Hình thức giặt của cả đơn. */
  orderType: OrderType
  items: BookingItemDraft[]
  dropoffMethod: DropoffMethod
  returnMethod: ReturnMethod
  pickupAreaId: number | null
  deliveryAreaId: number | null
  pickupAddress: string
  deliveryAddress: string
  /** YYYY-MM-DD, ngày Việt Nam. */
  appointmentDate: string | null
  appointmentHour: number | null
  /** Giờ nhận lại; rỗng = chưa chọn. */
  returnDate: string | null
  returnHour: number | null
  contactName: string
  contactPhone: string
  note: string
  washWhitesSeparately: boolean
  termsAccepted: boolean
}

export interface StoredDraft {
  values: BookingDraft
  step: 1 | 2 | 3 | 4 | 5
  owner: string | null
  prefilled: boolean
}

/** Dịch vụ tối thiểu domain cần (domain không import feature khác). */
export interface BookingService {
  id: number
  name: string
  unit: BookingUnit
  price: number
  expressSupported: boolean
  expressSurcharge: number | null
  whitesApplicable: boolean
}

export interface BookingArea {
  id: number
  name: string
  pickupFee: number
  deliveryFee: number
}

export interface BookingStore {
  openingTime: string
  closingTime: string
}

/** Một đơn trong OnlineBookingResponse (contract 029 §1). */
export interface BookingOrder {
  orderCode: string
  orderType: OrderType
  status: string
  createdAt: string
  appointmentAt: string
  dueAt: string | null
  contactName: string
  contactPhone: string
  dropoffMethod: DropoffMethod
  returnMethod: ReturnMethod
  pickupAreaName: string | null
  deliveryAreaName: string | null
  pickupAddress: string | null
  deliveryAddress: string | null
  note: string | null
  services: { serviceId: number; serviceName: string | null }[]
  washWhitesSeparately: boolean
  pickupFee: number
  deliveryFee: number
}

/** Khớp OnlineBookingResponse (POST /customer-portal/bookings/intake). */
export interface BookingIntakeResult {
  intakeCode: string
  created: boolean
  orders: BookingOrder[]
}
