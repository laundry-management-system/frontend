import type { VoucherListParams } from '../data/vouchersApi'

export const voucherKeys = {
  all: ['vouchers'] as const,
  list: (params: VoucherListParams) => [...voucherKeys.all, 'list', params] as const,
  byCode: (code: string) => [...voucherKeys.all, 'by-code', code] as const,
}
