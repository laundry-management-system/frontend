import type { Customer, CustomerOrder } from '../domain/types'
import type { CustomerOrderDto, CustomerResponseDto } from './dto'

export const toCustomer = (dto: CustomerResponseDto): Customer => ({
  id: dto.id,
  code: dto.customerCode,
  fullName: dto.fullName,
  phone: dto.phone,
  address: dto.address,
  note: dto.note,
  isVip: dto.isVip ?? false,
  status: dto.status,
  createdBy: dto.createdBy,
  createdAt: dto.createdAt,
})

export const toCustomerOrder = (dto: CustomerOrderDto): CustomerOrder => ({
  id: dto.id,
  code: dto.orderCode,
  receivedAt: dto.receivedAt,
  serviceName: dto.serviceName,
  totalAmount: Number(dto.totalAmount),
  status: dto.status,
  paymentStatus: dto.paymentStatus,
})
