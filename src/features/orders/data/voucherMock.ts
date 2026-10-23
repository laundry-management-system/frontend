import type { Voucher } from '../domain/types'

// shortcut: voucher mock, thay bằng API khi BE có module voucher (handoff #8)
const MOCK_VOUCHERS: Voucher[] = [
  {
    code: 'GIAT10',
    discountType: 'PERCENT',
    discountValue: 10,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    minOrderValue: 100000,
    maxUses: 1000,
    usedCount: 0,
    status: 'ACTIVE',
  },
  {
    code: 'GIAM20K',
    discountType: 'AMOUNT',
    discountValue: 20000,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    minOrderValue: 0,
    maxUses: 1000,
    usedCount: 0,
    status: 'ACTIVE',
  },
  {
    code: 'HETHAN',
    discountType: 'PERCENT',
    discountValue: 15,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    minOrderValue: 0,
    maxUses: 100,
    usedCount: 0,
    status: 'ACTIVE',
  },
  {
    code: 'HETLUOT',
    discountType: 'AMOUNT',
    discountValue: 10000,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    minOrderValue: 0,
    maxUses: 50,
    usedCount: 50,
    status: 'ACTIVE',
  },
]

export const findVoucher = (code: string) =>
  MOCK_VOUCHERS.find((v) => v.code === code.trim().toUpperCase())
