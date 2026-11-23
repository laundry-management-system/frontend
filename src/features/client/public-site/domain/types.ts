export interface PublicStore {
  name: string
  address: string | null
  phone: string | null
  openingTime: string
  closingTime: string
  whitesFee: number
  compensationMultiplier: number
  compensationCapPerItem: number
  storageDays: number
}

export type PublicServiceUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'

export const UNIT_LABEL: Record<PublicServiceUnit, string> = {
  KG: 'kg',
  PIECE: 'món',
  SET: 'bộ',
  PRODUCT: 'sản phẩm',
}

export interface PublicService {
  id: number
  name: string
  unit: PublicServiceUnit
  minQuantity: number
  whitesApplicable: boolean
  prices: PublicServicePrice[]
}

export interface PublicServicePrice {
  washModeId: number
  price: number
}

export interface PublicWashMode {
  id: number
  name: string
  completionHours: number
  isDefault: boolean
}

export interface PublicServiceArea {
  id: number
  name: string
  pickupFee: number
  deliveryFee: number
}

/** Lựa chọn trong danh sách hiện tại; DTO công khai không có id nên định danh bằng vị trí + tên. */
export interface Pick {
  index: number
  name: string
}

export interface EstimateInput {
  service: Pick | null
  /** Chuỗi khách gõ, chấp nhận dấu phẩy hoặc chấm thập phân. */
  quantity: string
  washModeId: number | null
  mode: 'IN_STORE' | 'DOOR'
  area: Pick | null
  pickup: boolean
  delivery: boolean
}

export interface EstimateResult {
  billableQty: number
  belowMinimum: boolean
  subtotal: number
  deliveryFee: number
  total: number
}
