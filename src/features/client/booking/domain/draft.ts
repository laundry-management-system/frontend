import { returnSlots, toAppointmentIso } from './appointment.ts'
import type {
  BookingDraft,
  BookingItemDraft,
  BookingService,
  BookingSettings,
  DropoffMethod,
  OrderType,
  ReturnMethod,
} from './types.ts'

/** Body POST /api/customer-portal/bookings/intake (contract 028). */
export interface CreateBookingIntakeRequest {
  requestId: string
  orderType: OrderType
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
    orderType: 'NORMAL',
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

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/** Nháp cũ/hỏng trong sessionStorage → nháp đủ trường mới (D7: nháp chưa có orderType suy ra từ express cũ). Không bao giờ ném lỗi. */
export function migrateDraft(raw: unknown): BookingDraft {
  const {
    express: oldExpress,
    serviceAreaId: oldArea,
    normalReturnDate,
    normalReturnHour,
    expressReturnDate,
    expressReturnHour,
    ...v
  }: Record<string, unknown> = isObj(raw) ? raw : {}
  delete v.voucherCode // FR-021: nháp cũ còn mã voucher
  delete v.sameReturn
  const oldItems = (Array.isArray(v.items) ? v.items : []).filter(isObj)
  const items = oldItems.map((i) => ({ serviceId: i.serviceId }) as BookingItemDraft)
  const legacy = typeof oldArea === 'number' ? { pickupAreaId: oldArea, deliveryAreaId: oldArea } : {} // FR-032
  const allExpress = oldItems.length > 0 && oldItems.every((i) => i.express === true || oldExpress === true)
  const tier = v.orderType !== undefined
    ? {}
    : allExpress
      ? { orderType: 'EXPRESS', returnDate: expressReturnDate ?? null, returnHour: expressReturnHour ?? null }
      : { orderType: 'NORMAL', returnDate: normalReturnDate ?? null, returnHour: normalReturnHour ?? null }
  return { ...emptyDraft(), ...legacy, ...tier, ...v, items } as BookingDraft
}

export const TIER_LABEL: Record<OrderType, string> = { NORMAL: 'Giặt tiêu chuẩn', EXPRESS: 'Giặt nhanh' }

/** Thời gian giặt (giờ tối thiểu từ gửi đến nhận) của hình thức. */
export const gapHoursOf = (s: Pick<BookingSettings, 'returnGapHoursNormal' | 'returnGapHoursExpress'>, orderType: OrderType) =>
  orderType === 'EXPRESS' ? s.returnGapHoursExpress : s.returnGapHoursNormal

/** EXPRESS chỉ giữ dịch vụ hỗ trợ giặt nhanh; NORMAL trả lại chính `items`. */
export const itemsForTier = (items: BookingItemDraft[], orderType: OrderType, expressSupportedIds: readonly number[]) =>
  orderType === 'EXPRESS' ? items.filter((i) => expressSupportedIds.includes(i.serviceId)) : items

const orNull = (s: string) => s.trim() || null

const isoOrNull = (date: string | null, hour: number | null) =>
  date !== null && hour !== null ? toAppointmentIso(date, hour) : null

/** Có dịch vụ đã chọn áp dụng giặt riêng đồ trắng. */
export const hasWhitesService = (items: readonly BookingItemDraft[], services: readonly Pick<BookingService, 'id' | 'whitesApplicable'>[]) =>
  items.some((i) => services.find((s) => s.id === i.serviceId)?.whitesApplicable)

export function toIntakeRequest(
  d: BookingDraft,
  requestId: string,
  services: readonly Pick<BookingService, 'id' | 'whitesApplicable'>[],
): CreateBookingIntakeRequest {
  const pickup = d.dropoffMethod === 'PICKUP'
  const delivery = d.returnMethod === 'DELIVERY'
  return {
    requestId,
    orderType: d.orderType,
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

const STEP_2 = ['dropoffMethod', 'returnMethod', 'pickupAreaId', 'deliveryAreaId', 'pickupAddress', 'deliveryAddress']
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
function returnValid(dropoffIso: string | null, date: string | null, hour: number | null, r: ReturnRules) {
  if (dropoffIso === null) return false
  return returnSlots(dropoffIso, r.open, r.close, r.gapHours).some((s) => s.date === date && hour !== null && s.hours.includes(hour))
}

/**
 * Bỏ dịch vụ / khu vực đã ngừng, ép tại tiệm khi không giao nhận được; bỏ dịch vụ không hỗ trợ giặt nhanh khi
 * orderType EXPRESS (khi có `expressSupportedIds`); có `rules` thì xoá giờ nhận lại không còn hợp lệ với giờ gửi.
 * Không đổi gì thì trả lại chính `draft`.
 */
export function pruneDraft(
  draft: BookingDraft,
  serviceIds: readonly number[],
  areaIds: readonly number[],
  deliveryEnabled: boolean,
  rules?: ReturnRules,
  expressSupportedIds?: readonly number[],
  whitesApplicableIds?: readonly number[],
): BookingDraft {
  const kept = draft.items.filter((i) => serviceIds.includes(i.serviceId))
  const items = expressSupportedIds ? itemsForTier(kept, draft.orderType, expressSupportedIds) : kept
  const whitesGone = draft.washWhitesSeparately && !!whitesApplicableIds &&
    !items.some((i) => whitesApplicableIds.includes(i.serviceId))
  const gone = (id: number | null) => id !== null && !areaIds.includes(id)
  const pickupGone = gone(draft.pickupAreaId)
  const deliveryGone = gone(draft.deliveryAreaId)
  const forceStore = (!deliveryEnabled || areaIds.length === 0) &&
    (draft.dropoffMethod !== 'AT_STORE' || draft.returnMethod !== 'AT_STORE')
  const dropoff = isoOrNull(draft.appointmentDate, draft.appointmentHour)
  const clearReturn = !!rules && draft.returnHour !== null &&
    !returnValid(dropoff, draft.returnDate, draft.returnHour, rules)
  if (items.length === draft.items.length && !whitesGone && !pickupGone && !deliveryGone && !forceStore && !clearReturn) {
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
