import type { CustomerProfile } from '../domain/types'
import type { CustomerProfileDto } from './dto'

export const toCustomerProfile = (dto: CustomerProfileDto): CustomerProfile => ({ ...dto })
