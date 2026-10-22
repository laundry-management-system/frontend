import { formatMoney } from '@/shared/lib/format'

interface MoneyProps {
  value: number
  size?: 'md' | 'display'
}

export function Money({ value, size = 'md' }: MoneyProps) {
  return (
    <span className={size === 'display' ? 'text-numeric-display' : 'text-money'}>
      {formatMoney(value)}
    </span>
  )
}
