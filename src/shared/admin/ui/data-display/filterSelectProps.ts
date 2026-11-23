import type { SelectProps } from '@mantine/core'

/** Select lọc ở màn listing: dropdown rộng theo nhãn dài nhất (nhãn có tiền tố tên trường), không xuống dòng, không hẹp hơn ô. */
export const FILTER_SELECT_PROPS: Pick<SelectProps, 'comboboxProps' | 'styles'> = {
  comboboxProps: { width: 'max-content', position: 'bottom-start' },
  styles: { option: { whiteSpace: 'nowrap' }, dropdown: { minWidth: 200 } },
}
