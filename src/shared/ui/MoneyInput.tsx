import { NumberInput, type NumberInputProps } from '@mantine/core'

const rightAligned = { input: { textAlign: 'right' as const } }

/** Số tiền VND: căn phải, phân cách nghìn bằng dấu chấm, hậu tố đ */
export function MoneyInput(props: NumberInputProps) {
  return (
    <NumberInput
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={0}
      allowNegative={false}
      rightSection="đ"
      styles={rightAligned}
      {...props}
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
