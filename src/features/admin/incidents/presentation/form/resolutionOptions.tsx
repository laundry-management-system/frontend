import { type SelectProps, Stack, Text } from '@mantine/core'
import { RESOLUTION_LABEL } from '../../domain/types'

// Mỗi phương án một mô tả ngắn để phân biệt Giảm giá (trừ tiền dịch vụ) với Bồi thường (đền giá trị món)
const OPTIONS = [
  {
    value: 'REWASH',
    label: RESOLUTION_LABEL.REWASH,
    description: 'Làm lại miễn phí, không trả tiền',
  },
  {
    value: 'DISCOUNT',
    label: RESOLUTION_LABEL.DISCOUNT,
    description: 'Bớt tiền dịch vụ, tối đa bằng thành tiền của dòng',
  },
  {
    value: 'COMPENSATION',
    label: RESOLUTION_LABEL.COMPENSATION,
    description: 'Đền giá trị món, tối đa theo điều khoản bồi thường',
  },
] as const
export const RESOLUTION_OPTIONS = OPTIONS.map(({ value, label }) => ({ value, label }))
const DESCRIPTION_OF: Record<string, string> = Object.fromEntries(
  OPTIONS.map((o) => [o.value, o.description]),
)
export const renderResolutionOption: SelectProps['renderOption'] = ({ option }) => (
  <Stack gap={0}>
    <Text size="sm">{option.label}</Text>
    <Text size="xs" c="dimmed">
      {DESCRIPTION_OF[option.value]}
    </Text>
  </Stack>
)
