import type { Machine, MachineFormValues, MachineStatus, MachineType } from './types'

export const MACHINE_LIMITS = {
  name: 50,
  note: 255,
  reason: 500,
  capacityMax: 9999.9,
  brand: 50,
  model: 50,
  serial: 50,
  location: 100,
} as const

export const EMPTY_MACHINE_FORM: MachineFormValues = {
  name: '',
  type: 'WASHER',
  capacityKg: '',
  note: '',
  brand: '',
  model: '',
  serialNumber: '',
  location: '',
  purchaseDate: null,
  warrantyUntil: null,
  image: null,
  quantity: 1,
  serialNumbers: [],
}

export function countByStatus(machines: Machine[]): Record<MachineStatus, number> {
  const counts = { READY: 0, MAINTENANCE: 0, RETIRED: 0 }
  for (const m of machines) counts[m.status]++
  return counts
}

export function countByType(machines: Machine[]): Record<MachineType | 'ALL', number> {
  const counts = { ALL: machines.length, WASHER: 0, DRYER: 0 }
  for (const m of machines) counts[m.type]++
  return counts
}

export const summaryText = (c: Record<MachineStatus, number>) =>
  `${c.READY} sẵn sàng · ${c.MAINTENANCE} bảo trì · ${c.RETIRED} ngừng`

/** Khớp MachineService.changeStatus của BE: RETIRED chỉ Admin, và chỉ về READY. */
export function allowedTransitions(status: MachineStatus, isAdmin: boolean): MachineStatus[] {
  if (status === 'RETIRED') return isAdmin ? ['READY'] : []
  const toggle: MachineStatus = status === 'READY' ? 'MAINTENANCE' : 'READY'
  return isAdmin ? [toggle, 'RETIRED'] : [toggle]
}

export const toFormValues = (m?: Machine): MachineFormValues =>
  m
    ? {
        name: m.name,
        type: m.type,
        capacityKg: m.capacityKg,
        note: m.note ?? '',
        brand: m.brand ?? '',
        model: m.model ?? '',
        serialNumber: m.serialNumber ?? '',
        location: m.location ?? '',
        purchaseDate: m.purchaseDate,
        warrantyUntil: m.warrantyUntil,
        image: m.image,
        quantity: 1,
        serialNumbers: [],
      }
    : EMPTY_MACHINE_FORM

export const toUpdatePayload = (v: MachineFormValues) => ({
  name: v.name.trim(),
  type: v.type,
  capacityKg: Number(v.capacityKg),
  note: v.note.trim() || null,
  brand: v.brand.trim(),
  model: v.model.trim() || null,
  serialNumber: v.serialNumber.trim().toUpperCase() || null,
  location: v.location.trim() || null,
  purchaseDate: v.purchaseDate,
  warrantyUntil: v.warrantyUntil,
  imageId: v.image?.id ?? null,
})

export const MAX_BATCH_QUANTITY = 20

const normalizeSerial = (s: string) => s.trim().toUpperCase()

/** Một máy: dùng ô serial chung; nhiều máy: mỗi máy một serial riêng. */
export function toCreateRequest(v: MachineFormValues) {
  const quantity = Number(v.quantity)
  if (quantity <= 1) return { dto: toUpdatePayload(v), quantity: 1, serialNumbers: [] }
  return {
    dto: { ...toUpdatePayload(v), serialNumber: null },
    quantity,
    serialNumbers: resizeSerials(v.serialNumbers, quantity).map((s) => normalizeSerial(s) || null),
  }
}

export const resizeSerials = (serials: string[], n: number) =>
  Array.from({ length: Math.max(n, 0) }, (_, i) => serials[i] ?? '')

/** Vị trí các serial trùng với một ô phía trên (không phân biệt hoa thường, bỏ ô trống). */
export function duplicateSerialIndexes(serials: string[]): number[] {
  const seen = new Set<string>()
  return serials.flatMap((raw, i) => {
    const s = normalizeSerial(raw)
    if (!s) return []
    if (seen.has(s)) return [i]
    seen.add(s)
    return []
  })
}

/** Mã máy W-<3 ký tự đầu của hãng>-00X do BE cấp; hàm này chỉ để xem trước tiền tố. */
export function codePrefix(type: MachineType, brand: string): string | null {
  const short = brand
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 3)
  return short ? `${type === 'WASHER' ? 'W' : 'D'}-${short}-` : null
}

/** "W03" hoặc "W03–W05" cho thông báo sau khi thêm. */
export const createdCodesLabel = (machines: Pick<Machine, 'code'>[]) =>
  machines.length > 1
    ? `${machines[0].code}–${machines[machines.length - 1].code}`
    : (machines[0]?.code ?? '')

/** Lỗi validate của endpoint tạo nhiều máy có tiền tố `machine.` */
export const stripBatchPrefix = (errors: Record<string, string>) =>
  Object.fromEntries(Object.entries(errors).map(([k, v]) => [k.replace(/^machine\./, ''), v]))

type ErrorLike = { status: number; message: string }

// BE trả detail tiếng Anh nên phải so khớp chuỗi
const STALE_STATE = [/already in status/i, /retired/i]

/** Lỗi do dữ liệu trên màn đã cũ: cần tải lại danh sách. */
export const isStaleMachineError = (err: ErrorLike) =>
  err.status === 403 ||
  err.status === 404 ||
  (err.status === 400 && STALE_STATE.some((re) => re.test(err.message)))

/** 403 không có ở đây: queryClient đã báo lỗi quyền chung. */
export function machineErrorMessage(err: ErrorLike): string {
  if (err.status === 404) return 'Không tìm thấy máy'
  if (err.status === 400 && /already in status/i.test(err.message)) return 'Máy đã ở trạng thái này'
  if (err.status === 400 && /retired/i.test(err.message))
    return 'Máy đã ngừng sử dụng, cần kích hoạt lại trước'
  return err.message
}

/** Hãng đã dùng, gộp không phân biệt hoa thường (giữ cách viết gặp đầu tiên). */
export function brandOptions(machines: Pick<Machine, 'brand'>[]): string[] {
  const seen = new Map<string, string>()
  for (const { brand } of machines) {
    const b = brand?.trim()
    if (b && !seen.has(b.toLowerCase())) seen.set(b.toLowerCase(), b)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'vi'))
}

export const WARRANTY_SOON_DAYS = 30

export type WarrantyInfo =
  { kind: 'active' | 'expiring'; daysLeft: number } | { kind: 'expired' } | null

const DAY_MS = 86_400_000
const dayNumber = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS

/** Ngày dạng YYYY-MM-DD; `today` truyền vào để test được. */
export function warrantyInfo(warrantyUntil: string | null, today: string): WarrantyInfo {
  if (!warrantyUntil) return null
  const daysLeft = dayNumber(warrantyUntil) - dayNumber(today)
  if (daysLeft < 0) return { kind: 'expired' }
  return { kind: daysLeft <= WARRANTY_SOON_DAYS ? 'expiring' : 'active', daysLeft }
}
