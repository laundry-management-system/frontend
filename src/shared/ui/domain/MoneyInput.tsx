import { NumberInput, type NumberInputProps } from '@mantine/core'

const rightAligned = { input: { textAlign: 'right' as const } }

interface MoneyInputProps extends NumberInputProps {
  /** Nhập theo nghìn đồng: gõ 300 = 300.000đ. Chỉ dùng cho tiền mặt (luôn chẵn nghìn) */
  inThousands?: boolean
}

/** Số tiền VND: căn phải, phân cách nghìn bằng dấu chấm, hậu tố đ */
export function MoneyInput({ inThousands, value, onChange, ...props }: MoneyInputProps) {
  const thousands = inThousands
    ? {
        value: typeof value === 'number' ? value / 1000 : value,
        onChange: (v: number | string) => onChange?.(typeof v === 'number' ? v * 1000 : v),
        // Hậu tố nằm liền trong ô nên đọc liền thành "300.000 đ"
        suffix: '.000 đ',
        rightSection: null,
      }
    : { value, onChange }
  return (
    <NumberInput
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      allowNegative={false}
      rightSection="đ"
      styles={rightAligned}
      hideControls
      {...props}
      {...thousands}
    />
  )
}

/** Khối lượng: căn phải, 1 chữ số thập phân với dấu phẩy, hậu tố kg */
export function WeightInput(props: NumberInputProps) {
  return (
    <NumberInput
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={1}
      allowNegative={false}
      rightSection="kg"
      styles={rightAligned}
      {...props}
    />
  )
}
