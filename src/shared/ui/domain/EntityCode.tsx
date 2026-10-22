/** Mã định danh (mã đơn, mã KH, mã NV, mã DV…): luôn dùng font mono của DS. */
export function EntityCode({ code, size = 'md' }: { code: string; size?: 'md' | 'sm' }) {
  return <span className={size === 'sm' ? 'text-code-sm' : 'text-code-md'}>{code}</span>
}
