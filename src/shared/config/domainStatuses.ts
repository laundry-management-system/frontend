// Nguồn duy nhất cho mọi trạng thái nghiệp vụ (Laundry DS: src/tokens/domain.ts). TS thuần để chạy được với node --test.

export type Tone =
  'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'express' | 'danger' | 'vip'

export type StatusGroup =
  'order' | 'payment' | 'payment-method' | 'flag' | 'machine' | 'voucher' | 'incident' | 'role'

export type StatusIcon = 'wallet' | 'qr-code' | 'triangle-alert' | 'zap' | 'star' | 'package'

export interface DomainStatus {
  group: StatusGroup
  key: string
  label: string
  tone: Tone
  /** Nền đặc cho cờ cần nổi bật tuyệt đối (TRỄ, Giặt nhanh) */
  solid?: boolean
  icon?: StatusIcon
}

export const GROUP_LABEL: Record<StatusGroup, string> = {
  order: 'Đơn',
  payment: 'Thanh toán',
  'payment-method': 'Phương thức',
  flag: 'Cờ',
  machine: 'Máy',
  voucher: 'Voucher',
  incident: 'Sự cố',
  role: 'Vai trò',
}

export const DOMAIN_STATUSES: DomainStatus[] = [
  { group: 'order', key: 'new', label: 'Mới nhận', tone: 'info' },
  { group: 'order', key: 'processing', label: 'Đang xử lý', tone: 'primary' },
  { group: 'order', key: 'completed', label: 'Hoàn thành', tone: 'success' },
  { group: 'order', key: 'delivered', label: 'Đã giao', tone: 'neutral' },
  { group: 'order', key: 'cancelled', label: 'Đã hủy', tone: 'danger' },
  { group: 'payment', key: 'unpaid', label: 'Chưa thanh toán', tone: 'warning' },
  { group: 'payment', key: 'paid', label: 'Đã thanh toán', tone: 'success' },
  { group: 'payment-method', key: 'cash', label: 'Tiền mặt', tone: 'neutral', icon: 'wallet' },
  { group: 'payment-method', key: 'qr', label: 'Chuyển khoản (QR)', tone: 'info', icon: 'qr-code' },
  { group: 'flag', key: 'late', label: 'TRỄ', tone: 'danger', solid: true, icon: 'triangle-alert' },
  { group: 'flag', key: 'express', label: 'Giặt nhanh', tone: 'express', solid: true, icon: 'zap' },
  { group: 'flag', key: 'vip', label: 'VIP', tone: 'vip', icon: 'star' },
  { group: 'flag', key: 'stale', label: 'Đồ tồn', tone: 'warning', icon: 'package' },
  { group: 'machine', key: 'ready', label: 'Sẵn sàng', tone: 'success' },
  { group: 'machine', key: 'maintenance', label: 'Bảo trì', tone: 'warning' },
  { group: 'machine', key: 'retired', label: 'Ngừng sử dụng', tone: 'neutral' },
  { group: 'voucher', key: 'active', label: 'Còn hạn', tone: 'success' },
  { group: 'voucher', key: 'expired', label: 'Hết hạn', tone: 'neutral' },
  { group: 'voucher', key: 'exhausted', label: 'Hết lượt', tone: 'warning' },
  { group: 'voucher', key: 'disabled', label: 'Đã tắt', tone: 'neutral' },
  { group: 'incident', key: 'pending', label: 'Chờ duyệt', tone: 'warning' },
  { group: 'incident', key: 'approved', label: 'Đã duyệt', tone: 'success' },
  { group: 'incident', key: 'rejected', label: 'Từ chối', tone: 'danger' },
  { group: 'role', key: 'admin', label: 'Admin', tone: 'vip' },
  { group: 'role', key: 'staff', label: 'Nhân viên', tone: 'primary' },
]

export const statusOf = (group: string, key: string): DomainStatus => {
  const s = DOMAIN_STATUSES.find((x) => x.group === group && x.key === key)
  if (!s) throw new Error(`Unknown status ${group}/${key}`)
  return s
}
