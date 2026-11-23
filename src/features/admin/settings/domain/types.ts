export type SettingKey =
  | 'STORE_NAME'
  | 'STORE_ADDRESS'
  | 'COMPENSATION_MULTIPLIER'
  | 'COMPENSATION_CAP_PER_ITEM'
  | 'STORAGE_DAYS'
  | 'BANK_BIN'
  | 'BANK_ACCOUNT_NO'
  | 'BANK_ACCOUNT_NAME'
  | 'OPENING_TIME'
  | 'CLOSING_TIME'
  | 'OVERDUE_DAYS'
  | 'WHITES_FEE'
  | 'MAX_LOGIN_FAIL'
  | 'LOCK_MINUTES'
  | 'STORE_PHONE'
  | 'BOOKING_ENABLED'
  | 'BOOKING_DELIVERY_ENABLED'
  | 'BOOKING_MIN_LEAD_HOURS'
  | 'BOOKING_MAX_OPEN_PER_CUSTOMER'
  | 'BOOKING_PICKUP_MIN_AMOUNT'

/** BANK chỉ có ở FE (ô chọn ngân hàng); BE coi BANK_BIN là số nguyên dương */
export type SettingType =
  'TIME' | 'POSITIVE_INT' | 'NON_NEGATIVE_INT' | 'STRING' | 'BANK' | 'PHONE' | 'BOOLEAN'

export type SettingGroup =
  'RECEIPT' | 'COMPENSATION' | 'VIETQR' | 'OPERATION' | 'SECURITY' | 'OTHER'

export interface Setting {
  /** string chứ không phải SettingKey: BE có thể thêm key mới */
  key: string
  value: string
  description: string | null
  updatedBy: number | null
  updatedAt: string | null
}

export interface SettingField {
  key: string
  group: SettingGroup
  label: string
  unit?: string
  type: SettingType
  multiline?: boolean
}

export interface ShopSettings {
  /** Phụ phí giặt riêng đồ trắng (đ/đơn) */
  whitesFee: number
  compensationMultiplier: number
  compensationCap: number
}

export interface ServiceArea {
  id: number
  name: string
  pickupFee: number
  deliveryFee: number
  active: boolean
}

/** NumberInput của Mantine trả '' khi ô trống */
export interface ServiceAreaFormValues {
  name: string
  pickupFee: number | ''
  deliveryFee: number | ''
}
