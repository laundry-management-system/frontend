import { useDebouncedValue } from '@mantine/hooks'

/** Bọc Mantine để cả app dùng một chỗ, đổi delay mặc định tại đây. */
export function useDebounce<T>(value: T, delay = 300): T {
  return useDebouncedValue(value, delay)[0]
}
