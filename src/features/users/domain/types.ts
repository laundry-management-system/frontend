export type Role = 'ADMIN' | 'STAFF'

export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface User {
  id: number
  employeeCode: string
  fullName: string
  phone: string
  username: string
  role: Role
  status: UserStatus
  hiredDate: string | null
}

export const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Admin', STAFF: 'Nhân viên' }

export const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Đang làm',
  INACTIVE: 'Ngừng hoạt động',
}
