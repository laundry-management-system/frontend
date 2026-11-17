import { httpClient } from '@/shared/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/api/page'
import type { VoucherStatus } from '../domain/types'
import type { CreateVoucherRequestDto, UpdateVoucherRequestDto, VoucherResponseDto } from './dto'
import { toVoucher } from './mapper'

export interface VoucherListParams {
  search?: string
  /** Từ 0 */
  page: number
  size: number
}

export const vouchersApi = {
  list: async ({ search, page, size }: VoucherListParams) => {
    const { data } = await httpClient.get<SpringPage<VoucherResponseDto>>('/vouchers', {
      params: { search: search || undefined, page, size, sort: 'createdAt,desc' },
    })
    return fromSpringPage(data, toVoucher)
  },

  /** Không có mã → null (để ô áp mã báo "không tồn tại" thay vì lỗi) */
  getByCode: async (code: string) => {
    try {
      const { data } = await httpClient.get<VoucherResponseDto>(
        `/vouchers/by-code/${encodeURIComponent(code)}`,
      )
      return toVoucher(data)
    } catch (err) {
      if ((err as { status?: number }).status === 404) return null
      throw err
    }
  },

  create: async (dto: CreateVoucherRequestDto) =>
    toVoucher((await httpClient.post<VoucherResponseDto>('/vouchers', dto)).data),

  update: async (id: number, dto: UpdateVoucherRequestDto) =>
    toVoucher((await httpClient.put<VoucherResponseDto>(`/vouchers/${id}`, dto)).data),

  changeStatus: async (id: number, status: VoucherStatus) =>
    toVoucher(
      (await httpClient.patch<VoucherResponseDto>(`/vouchers/${id}/status`, { status })).data,
    ),
}
