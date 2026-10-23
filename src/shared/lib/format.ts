import dayjs from 'dayjs'

const number = new Intl.NumberFormat('vi-VN')

export const formatMoney = (value: number) => `${number.format(value)}đ`

export const formatNumber = (value: number) => number.format(value)

export const formatDateTime = (value: string | Date) => dayjs(value).format('DD/MM/YYYY HH:mm:ss')

export const formatDate = (value: string | Date) => dayjs(value).format('DD/MM/YYYY')

/** Chuẩn hóa họ tên: gộp khoảng trắng, viết hoa chữ đầu mỗi từ ("nguyễn  văn a" → "Nguyễn Văn A"). */
export const formatPersonName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi'))
    .join(' ')

/** Ô họ tên: bỏ chữ số ngay khi gõ / dán. */
export const stripDigits = (value: string) => value.replace(/\d/g, '')
