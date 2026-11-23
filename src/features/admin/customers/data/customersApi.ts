import { httpClient } from '@/shared/common/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/common/api/page'
import type { CustomerStatus, OrderStatus } from '../domain/types'
import type {
  CreateCustomerRequestDto,
  CustomerOrderDto,
  CustomerResponseDto,
  UpdateCustomerRequestDto,
} from './dto'
import { toCustomer, toCustomerOrder } from './mapper'

export interface CustomerListParams {
  search?: string
  status?: CustomerStatus
  pendingAccount?: boolean
  page: number
  size: number
}

export interface CustomerOrdersParams {
  phone: string
  status?: OrderStatus
  page: number
  size: number
}

const OPEN_STATUSES: OrderStatus[] = [
  'PENDING_CONFIRMATION',
  'AWAITING_DROPOFF',
  'RECEIVED',
  'PROCESSING',
  'COMPLETED',
]

export const customersApi = {
  list: async ({ search, status, pendingAccount, page, size }: CustomerListParams) => {
    const { data } = await httpClient.get<SpringPage<CustomerResponseDto>>('/customers', {
      params: {
        search: search || undefined,
        status,
        pendingAccount: pendingAccount || undefined,
        page,
        size,
        sort: 'createdAt,desc',
      },
    })
    return fromSpringPage(data, toCustomer)
  },

  get: async (id: number) =>
    toCustomer((await httpClient.get<CustomerResponseDto>(`/customers/${id}`)).data),

  getByPhone: async (phone: string) =>
    toCustomer((await httpClient.get<CustomerResponseDto>(`/customers/by-phone/${phone}`)).data),

  create: async (dto: CreateCustomerRequestDto) =>
    toCustomer((await httpClient.post<CustomerResponseDto>('/customers', dto)).data),

  update: async (id: number, dto: UpdateCustomerRequestDto) =>
    toCustomer((await httpClient.put<CustomerResponseDto>(`/customers/${id}`, dto)).data),

  changeStatus: async (id: number, status: CustomerStatus) =>
    toCustomer(
      (await httpClient.patch<CustomerResponseDto>(`/customers/${id}/status`, { status })).data,
    ),

  listOrdersByPhone: async ({ phone, status, page, size }: CustomerOrdersParams) => {
    const { data } = await httpClient.get<SpringPage<CustomerOrderDto>>('/orders', {
      params: { phone, status, page, size, sort: 'receivedAt,desc' },
    })
    return fromSpringPage(data, toCustomerOrder)
  },

  countOpenOrders: async (phone: string) => {
    const pages = await Promise.all(
      OPEN_STATUSES.map((status) =>
        customersApi.listOrdersByPhone({ phone, status, page: 0, size: 1 }),
      ),
    )
    return pages.reduce((sum, p) => sum + p.page.totalElements, 0)
  },
}
