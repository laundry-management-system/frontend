import dayjs from 'dayjs'

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

export const formatMoney = (value: number) => currency.format(value)

export const formatDateTime = (value: string | Date) => dayjs(value).format('DD/MM/YYYY HH:mm:ss')
