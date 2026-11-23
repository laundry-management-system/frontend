import { returnSlots, toAppointmentIso } from './appointment.ts'
import type {
  BookingDraft,
  BookingItemDraft,
  BookingService,
  BookingWashMode,
  DropoffMethod,
  ReturnMethod,
} from './types.ts'

/** Body POST /api/customer-portal/bookings/intake (contract 028). */
export interface CreateBookingIntakeRequest {
  requestId: string
  washModeId: number
  items: { serviceId: number }[]
  dropoffMethod: DropoffMethod
  returnMethod: ReturnMethod
  pickupAreaId: number | null
  deliveryAreaId: number | null
  pickupAddress: string | null
  deliveryAddress: string | null
  appointmentAt: string | null
  returnAt: string | null
  contactName: string | null
  contactPhone: string | null
  note: string | null
  washWhitesSeparately: boolean
  termsAccepted: true
}

export type BookingStep = 1 | 2 | 3 | 4 | 5

export function emptyDraft(): BookingDraft {
  return {
    washModeId: null,
    items: [],
    dropoffMethod: 'AT_STORE',
    returnMethod: 'AT_STORE',
    pickupAreaId: null,
    deliveryAreaId: null,
    pickupAddress: '',
    deliveryAddress: '',
    appointmentDate: null,
    appointmentHour: null,
    returnDate: null,
    returnHour: null,
    contactName: '',
    contactPhone: '',
    note: '',
    washWhitesSeparately: false,
    termsAccepted: false,
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)

/** Nháp cũ/hỏng trong sessionStorage → nháp đủ trường mới Không bao giờ ném lỗi. */
export function migrateDraft(raw: unknown): BookingDraft {
  const { serviceAreaId: oldArea, ...v }: Record<string, unknown> = isObj(raw) ? raw : {}
  delete v.voucherCode // FR-021: nháp cũ còn mã voucher
  delete v.sameReturn
  delete v.express
  delete v.orderType // nháp cũ chọn hình thức NORMAL/EXPRESS: bỏ, chọn lại theo hình thức động
  delete v.normalReturnDate
  delete v.normalReturnHour
  delete v.expressReturnDate
  delete v.expressReturnHour
  const oldItems = (Array.isArray(v.items) ? v.items : []).filter(isObj)
  const items = oldItems.map((i) => ({ serviceId: i.serviceId }) as BookingItemDraft)
  const legacy =
    typeof oldArea === 'number' ? { pickupAreaId: oldArea, deliveryAreaId: oldArea } : {} // FR-032
  return { ...emptyDraft(), ...legacy, ...v, items } as BookingDraft
}

/** Giá của dịch vụ theo hình thức; null = không áp dụng hình thức này. */
export const priceOf = (s: Pick<BookingService, 'prices'>, washModeId: number | null) =>
  s.prices.find((p) => p.washModeId === washModeId)?.price ?? null

/** Dòng giá cho ServiceSummaryList; undefined khi không tìm thấy dịch vụ hoặc không có giá hình thức. */
export function pricedOf(
  s: Pick<BookingService, 'prices' | 'unit'> | undefined,
  washModeId: number | null,
) {
  const price = s ? priceOf(s, washModeId) : null
  return s && price !== null ? { price, unit: s.unit } : undefined
}

/** Thời gian giặt (giờ tối thiểu từ gửi đến nhận) = completionHours của hình thức; chưa có hình thức → 0. */
export const gapHoursOf = (modes: readonly BookingWashMode[], washModeId: number | null) =>
  modes.find((m) => m.id === washModeId)?.completionHours ?? 0

const orNull = (s: string) => s.trim() || null

const isoOrNull = (date: string | null, hour: number | null) =>
  date !== null && hour !== null ? toAppointmentIso(date, hour) : null

/** Có dịch vụ đã chọn áp dụng giặt riêng đồ trắng. */
export const hasWhitesService = (
  items: readonly BookingItemDraft[],
  services: readonly Pick<BookingService, 'id' | 'whitesApplicable'>[],
) => items.some((i) => services.find((s) => s.id === i.serviceId)?.whitesApplicable)

export function toIntakeRequest(
  d: BookingDraft,
  requestId: string,
  services: readonly Pick<BookingService, 'id' | 'whitesApplicable'>[],
): CreateBookingIntakeRequest {
  const pickup = d.dropoffMethod === 'PICKUP'
  const delivery = d.returnMethod === 'DELIVERY'
  return {
    requestId,
    washModeId: d.washModeId as number, // bước 1 đã chặn null
    items: d.items.map((i) => ({ serviceId: i.serviceId })),
    dropoffMethod: d.dropoffMethod,
    returnMethod: d.returnMethod,
    pickupAreaId: pickup ? d.pickupAreaId : null,
    deliveryAreaId: delivery ? d.deliveryAreaId : null,
    pickupAddress: pickup ? orNull(d.pickupAddress) : null,
    deliveryAddress: delivery ? orNull(d.deliveryAddress) : null,
    appointmentAt: isoOrNull(d.appointmentDate, d.appointmentHour),
    returnAt: isoOrNull(d.returnDate, d.returnHour),
    contactName: orNull(d.contactName),
    contactPhone: orNull(d.contactPhone),
    note: orNull(d.note),
    washWhitesSeparately: d.washWhitesSeparately && hasWhitesService(d.items, services),
    termsAccepted: true,
  }
}

const STEP_2 = [
  'dropoffMethod',
  'returnMethod',
  'pickupAreaId',
  'deliveryAreaId',
  'pickupAddress',
  'deliveryAddress',
]
const STEP_4 = ['contactName', 'contactPhone', 'note', 'termsAccepted']

/** Bước chứa ô của khóa lỗi BE; khóa lạ → 5 (hiện Alert ở bước xác nhận). */
export function stepOfField(key: string): BookingStep {
  if (/^items($|[[.])/.test(key) || key === 'washWhitesSeparately') return 1
  if (STEP_2.includes(key)) return 2
  if (key === 'appointmentAt' || key === 'returnAt') return 3
  if (STEP_4.includes(key)) return 4
  return 5
}

/** Khóa lỗi BE → đường dẫn ô của `@mantine/form`. */
export function toFormPath(key: string): string {
  return key === 'appointmentAt' || key === 'returnAt'
    ? key.replace('At', 'Hour')
    : key.replace(/\[(\d+)\]/g, '.$1')
}

export interface ReturnRules {
  open: string
  close: string
  gapHours: number
}

/** Giờ nhận đã chọn còn nằm trong returnSlots của giờ gửi hiện tại; chưa có giờ gửi → không hợp lệ. */
function returnValid(
  dropoffIso: string | null,
  date: string | null,
  hour: number | null,
  r: ReturnRules,
) {
  if (dropoffIso === null) return false
  return returnSlots(dropoffIso, r.open, r.close, r.gapHours).some(
    (s) => s.date === date && hour !== null && s.hours.includes(hour),
  )
}

/**
 * Bỏ dịch vụ / khu vực đã ngừng, ép tại tiệm khi không giao nhận được; `serviceIds` là các dịch vụ có giá theo
 * hình thức đã chọn (dịch vụ thiếu giá hình thức bị bỏ); có `rules` thì xoá giờ nhận lại không còn hợp lệ với giờ gửi.
 * Không đổi gì thì trả lại chính `draft`.
 */
export function pruneDraft(
  draft: BookingDraft,
  serviceIds: readonly number[],
  areaIds: readonly number[],
  deliveryEnabled: boolean,
  rules?: ReturnRules,
  whitesApplicableIds?: readonly number[],
): BookingDraft {
  const items = draft.items.filter((i) => serviceIds.includes(i.serviceId))
  const whitesGone =
    draft.washWhitesSeparately &&
    !!whitesApplicableIds &&
    !items.some((i) => whitesApplicableIds.includes(i.serviceId))
  const gone = (id: number | null) => id !== null && !areaIds.includes(id)
  const pickupGone = gone(draft.pickupAreaId)
  const deliveryGone = gone(draft.deliveryAreaId)
  const forceStore =
    (!deliveryEnabled || areaIds.length === 0) &&
    (draft.dropoffMethod !== 'AT_STORE' || draft.returnMethod !== 'AT_STORE')
  const dropoff = isoOrNull(draft.appointmentDate, draft.appointmentHour)
  const clearReturn =
    !!rules &&
    draft.returnHour !== null &&
    !returnValid(dropoff, draft.returnDate, draft.returnHour, rules)
  if (
    items.length === draft.items.length &&
    !whitesGone &&
    !pickupGone &&
    !deliveryGone &&
    !forceStore &&
    !clearReturn
  ) {
    return draft
  }
  return {
    ...draft,
    items,
    ...(whitesGone && { washWhitesSeparately: false }),
    ...(pickupGone && { pickupAreaId: null }),
    ...(deliveryGone && { deliveryAreaId: null }),
    ...(forceStore && { dropoffMethod: 'AT_STORE', returnMethod: 'AT_STORE' }),
    ...(clearReturn && { returnDate: null, returnHour: null }),
  }
}
