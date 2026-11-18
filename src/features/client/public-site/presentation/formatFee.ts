import { formatMoney } from '@/shared/common/lib/format'
import { type PublicService, UNIT_LABEL } from '../domain/types'

export const formatFee = (fee: number) => (fee === 0 ? 'Miễn phí' : formatMoney(fee))

export function expressParts(s: PublicService) {
  if (!s.expressSupported) return null
  return {
    surcharge: `+${formatMoney(s.expressSurcharge ?? 0)}/${UNIT_LABEL[s.unit]}`,
    hours: `${s.expressHours ?? '—'} giờ`,
  }
}
