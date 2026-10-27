export type SettingKey =
  | 'STORE_NAME'
  | 'STORE_ADDRESS'
  | 'COMPENSATION_TERMS'
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

/** BANK chỉ có ở FE (ô chọn ngân hàng); BE coi BANK_BIN là số nguyên dương */
export type SettingType = 'TIME' | 'POSITIVE_INT' | 'NON_NEGATIVE_INT' | 'STRING' | 'BANK'

export type SettingGroup = 'RECEIPT' | 'VIETQR' | 'OPERATION' | 'SECURITY' | 'OTHER'

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
}
