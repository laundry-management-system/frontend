// Header của AppShell là fixed: cột phụ ghim ngay dưới header, cao không quá phần còn lại của màn hình

/** Khớp breakpoint `lg` của Grid: chỉ ghim cột phụ khi trang đang chia 2 cột. */
export const TWO_COLUMNS_QUERY = '(min-width: 75em)'

export const STICKY_ASIDE = {
  position: 'sticky',
  top: 'calc(var(--app-shell-header-offset, 0rem) + var(--mantine-spacing-md))',
} as const

export const FIT_VIEWPORT = {
  maxHeight: 'calc(100dvh - var(--app-shell-header-offset, 0rem) - 2 * var(--mantine-spacing-md))',
} as const
