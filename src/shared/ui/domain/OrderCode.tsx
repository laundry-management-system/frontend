/** Mã đơn LD-YYYYMMDD-NNN, font mono */
export function OrderCode({ code }: { code: string }) {
  return <span className="text-code-md">{code}</span>
}
