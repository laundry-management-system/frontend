import { formatMoney } from '@/shared/lib/format'

export const formatFee = (fee: number) => (fee === 0 ? 'Miễn phí' : formatMoney(fee))
