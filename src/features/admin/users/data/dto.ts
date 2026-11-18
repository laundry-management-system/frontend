import type { Role, UserStatus } from '../domain/types'

export interface UserResponseDto {
  id: number
  employeeCode: string
  fullName: string
  phone: string
  email: string
  username: string
  role: Role
  status: UserStatus
  hiredDate: string | null
}

export interface CreateUserRequestDto {
  fullName: string
  phone: string
  email: string
  hiredDate: string | null
  role: Role
}

export interface UpdateUserRequestDto {
  fullName: string
  phone: string
}
