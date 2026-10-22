export type ServiceUnit = 'KG' | 'PIECE' | 'SET' | 'PRODUCT'

export type ServiceStatus = 'ACTIVE' | 'INACTIVE'

export interface Service {
  id: number
  code: string
  name: string
  unit: ServiceUnit | null
  price: number
  standardHours: number
  expressSupported: boolean
  /** Phụ phí giặt nhanh trên mỗi đơn vị (đồng) */
  expressSurcharge: number | null
  expressHours: number | null
  status: ServiceStatus
}

/** `''` là giá trị rỗng của NumberInput */
export interface ServiceFormValues {
  name: string
  unit: ServiceUnit | null
  price: number | ''
  standardHours: number | ''
  expressSupported: boolean
  expressSurcharge: number | ''
  expressHours: number | ''
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
