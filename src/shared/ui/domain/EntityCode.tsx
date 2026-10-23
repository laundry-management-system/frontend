export type EntityCodeSize = 'display' | 'md' | 'sm'

const CLASS: Record<EntityCodeSize, string> = {
  display: 'text-code-display',
  md: 'text-code-md',
  sm: 'text-code-sm',
}

/** Mã định danh (mã đơn, mã KH, mã NV, mã DV…): luôn dùng font mono của DS. */
export function EntityCode({ code, size = 'md' }: { code: string; size?: EntityCodeSize }) {
  return <span className={CLASS[size]}>{code}</span>
}
