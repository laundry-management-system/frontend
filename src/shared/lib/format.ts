import dayjs from 'dayjs'

const number = new Intl.NumberFormat('vi-VN')

// DS: 185.000đ (không khoảng trắng, không ký hiệu ₫)
export const formatMoney = (value: number) => `${number.format(value)}đ`

export const formatDateTime = (value: string | Date) => dayjs(value).format('DD/MM/YYYY HH:mm:ss')

export const formatDate = (value: string | Date) => dayjs(value).format('DD/MM/YYYY')
