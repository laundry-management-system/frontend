import type { User } from '../domain/types'
import type { UserResponseDto } from './dto'

export const toUser = (dto: UserResponseDto): User => ({ ...dto })
