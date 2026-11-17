export type MachineType = 'WASHER' | 'DRYER'

export type MachineStatus = 'READY' | 'MAINTENANCE' | 'RETIRED'

export interface MachineImage {
  id: number
  url: string
}

export interface Machine {
  id: number
  code: string
  name: string
  type: MachineType
  capacityKg: number
  status: MachineStatus
  note: string | null
  brand: string | null
  model: string | null
  serialNumber: string | null
  location: string | null
  /** YYYY-MM-DD */
  purchaseDate: string | null
  /** YYYY-MM-DD */
  warrantyUntil: string | null
  image: MachineImage | null
  updatedAt: string
}

export interface MachineFormValues {
  name: string
  type: MachineType
  capacityKg: number | ''
  note: string
  brand: string
  model: string
  serialNumber: string
  location: string
  purchaseDate: string | null
  warrantyUntil: string | null
  image: MachineImage | null
  /** Chỉ dùng khi thêm: tạo nhiều máy cùng thông tin */
  quantity: number | ''
  /** Serial riêng từng máy khi quantity > 1 */
  serialNumbers: string[]
}

export const MACHINE_TYPE_LABEL: Record<MachineType, string> = {
  WASHER: 'Máy giặt',
  DRYER: 'Máy sấy',
}

export const MACHINE_STATUS_LABEL: Record<MachineStatus, string> = {
  READY: 'Sẵn sàng',
  MAINTENANCE: 'Bảo trì',
  RETIRED: 'Ngừng sử dụng',
}
