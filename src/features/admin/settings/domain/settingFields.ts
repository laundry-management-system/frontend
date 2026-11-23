import type { SettingField, SettingGroup, SettingKey } from './types'

export const SETTING_FIELDS: (SettingField & { key: SettingKey })[] = [
  { key: 'STORE_NAME', group: 'RECEIPT', label: 'Tên cửa hàng', type: 'STRING' },
  { key: 'STORE_ADDRESS', group: 'RECEIPT', label: 'Địa chỉ', type: 'STRING' },
  { key: 'STORE_PHONE', group: 'RECEIPT', label: 'Số điện thoại', type: 'PHONE' },
  {
    key: 'STORAGE_DAYS',
    group: 'RECEIPT',
    label: 'Thời hạn lưu giữ đồ',
    unit: 'ngày',
    type: 'POSITIVE_INT',
  },
  {
    key: 'COMPENSATION_MULTIPLIER',
    group: 'COMPENSATION',
    label: 'Hệ số bồi thường K',
    unit: 'lần',
    type: 'POSITIVE_INT',
  },
  {
    key: 'COMPENSATION_CAP_PER_ITEM',
    group: 'COMPENSATION',
    label: 'Mức trần mỗi món',
    unit: 'đ',
    type: 'POSITIVE_INT',
  },
  { key: 'BANK_BIN', group: 'VIETQR', label: 'Ngân hàng', type: 'BANK' },
  { key: 'BANK_ACCOUNT_NO', group: 'VIETQR', label: 'Số tài khoản', type: 'STRING' },
  { key: 'BANK_ACCOUNT_NAME', group: 'VIETQR', label: 'Chủ tài khoản', type: 'STRING' },
  { key: 'OPENING_TIME', group: 'OPERATION', label: 'Giờ mở cửa', type: 'TIME' },
  { key: 'CLOSING_TIME', group: 'OPERATION', label: 'Giờ đóng cửa', type: 'TIME' },
  {
    key: 'OVERDUE_DAYS',
    group: 'OPERATION',
    label: 'Đơn Hoàn thành quá … ngày → Đồ tồn',
    unit: 'ngày',
    type: 'POSITIVE_INT',
  },
  {
    key: 'WHITES_FEE',
    group: 'OPERATION',
    label: 'Phụ phí giặt riêng đồ trắng (mỗi đơn)',
    unit: 'đ',
    type: 'NON_NEGATIVE_INT',
  },
  { key: 'BOOKING_ENABLED', group: 'OPERATION', label: 'Nhận đặt đơn online', type: 'BOOLEAN' },
  {
    key: 'BOOKING_DELIVERY_ENABLED',
    group: 'OPERATION',
    label: 'Nhận lấy và giao tận nơi',
    type: 'BOOLEAN',
  },
  {
    key: 'BOOKING_MIN_LEAD_HOURS',
    group: 'OPERATION',
    label: 'Đặt trước tối thiểu',
    unit: 'giờ',
    type: 'POSITIVE_INT',
  },
  {
    key: 'BOOKING_MAX_OPEN_PER_CUSTOMER',
    group: 'OPERATION',
    label: 'Số yêu cầu chưa đóng tối đa mỗi khách',
    unit: 'yêu cầu',
    type: 'POSITIVE_INT',
  },
  {
    key: 'BOOKING_RETURN_GAP_HOURS_NORMAL',
    group: 'OPERATION',
    label: 'Thời gian giặt tiêu chuẩn',
    unit: 'giờ',
    type: 'POSITIVE_INT',
  },
  {
    key: 'BOOKING_RETURN_GAP_HOURS_EXPRESS',
    group: 'OPERATION',
    label: 'Thời gian giặt nhanh',
    unit: 'giờ',
    type: 'POSITIVE_INT',
  },
  {
    key: 'MAX_LOGIN_FAIL',
    group: 'SECURITY',
    label: 'Khóa tài khoản sau … lần sai',
    unit: 'lần',
    type: 'POSITIVE_INT',
  },
  {
    key: 'LOCK_MINUTES',
    group: 'SECURITY',
    label: 'Thời gian khóa tạm',
    unit: 'phút',
    type: 'POSITIVE_INT',
  },
]

export const SETTING_GROUP_TITLE: Record<SettingGroup, string> = {
  RECEIPT: 'Thông tin in trên phiếu',
  COMPENSATION: 'Điều khoản bồi thường',
  VIETQR: 'Tài khoản nhận chuyển khoản (VietQR)',
  OPERATION: 'Vận hành',
  SECURITY: 'Bảo mật',
  OTHER: 'Khác',
}

/** Key BE mới thêm mà FE chưa khai báo vẫn sửa được dưới dạng văn bản */
export const fieldOf = (key: string): SettingField =>
  SETTING_FIELDS.find((f) => f.key === key) ?? { key, group: 'OTHER', label: key, type: 'STRING' }

export const settingLabel = (key: string) => fieldOf(key).label
