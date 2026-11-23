import { serviceCsvRows } from './report.ts'
import type {
  CustomerSpendingRow,
  DateRange,
  OperationsReport,
  RevenuePayment,
  VoucherRow,
} from './types'

export { serviceCsvRows }

const METHOD_TEXT = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản' } as const
const CHANNEL_TEXT = { ONLINE: 'Online', OFFLINE: 'Tại quầy' } as const

// en-CA cho ra yyyy-MM-dd; BE gửi instant UTC nên phải quy về giờ VN
const VN_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
const vnDate = (iso: string) => VN_DATE.format(new Date(iso))

/** `<báo-cáo>_<từ>_<đến>.csv` */
export const csvFileName = (report: string, p: DateRange) => `${report}_${p.from}_${p.to}.csv`

/** Mọi dòng, không cắt: giới hạn 5.000 dòng chỉ áp cho hiển thị. */
export const transactionCsvRows = (payments: RevenuePayment[]) => [
  ['Ngày', 'Số hóa đơn', 'Mã đơn', 'Khách hàng', 'Hình thức', 'Kênh', 'Số tiền'],
  ...payments.map((p) => [
    vnDate(p.paidAt),
    p.invoiceNo,
    p.orderCode,
    p.customerName,
    METHOD_TEXT[p.method],
    CHANNEL_TEXT[p.channel],
    p.amount,
  ]),
]

export const washModeCsvRows = (
  rows: { washModeName: string; orders: number; amount: number }[],
) => [
  ['Hình thức giặt', 'Số đơn', 'Doanh thu'],
  ...rows.map((r) => [r.washModeName, r.orders, r.amount]),
]

export const cancelReasonCsvRows = (rows: { label: string; count: number }[]) => [
  ['Lý do hủy', 'Số đơn'],
  ...rows.map((r) => [r.label, r.count]),
]

export const customerCsvRows = (rows: CustomerSpendingRow[]) => [
  ['Mã khách', 'Khách hàng', 'Số đơn', 'Chi tiêu', 'Đơn gần nhất'],
  ...rows.map((r) => [
    r.customerCode,
    r.customerName,
    r.orderCount,
    r.spent,
    r.lastOrderAt ? vnDate(r.lastOrderAt) : null,
  ]),
]

export const voucherCsvRows = (rows: VoucherRow[]) => [
  ['Mã voucher', 'Lượt dùng', 'Tiền giảm', 'Doanh thu'],
  ...rows.map((r) => [r.voucherCode, r.uses, r.discountTotal, r.revenue]),
]

export const staffCsvRows = (rows: OperationsReport['byStaff']) => [
  ['Nhân viên', 'Tên đăng nhập', 'Số đơn'],
  ...rows.map((r) => [r.fullName ?? r.username, r.username, r.orders]),
]
