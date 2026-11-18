import { EntityCode } from './EntityCode'

/** Mã đơn LD-YYYYMMDD-NNN */
export function OrderCode({ code }: { code: string }) {
  return <EntityCode code={code} />
}
