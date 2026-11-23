import { z } from 'zod'
import { rematch, validateQuantity } from '../domain/estimate'
import type {
  EstimateInput,
  PublicService,
  PublicServiceArea,
  PublicStore,
  PublicWashMode,
} from '../domain/types'

const money = z.number().int().nonnegative()

export const publicStoreSchema = z.object({
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  openingTime: z.string(),
  closingTime: z.string(),
  whitesFee: money,
  compensationMultiplier: z.number(),
  compensationCapPerItem: money,
  storageDays: z.number(),
}) satisfies z.ZodType<PublicStore>

export const publicServicesSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    unit: z.enum(['KG', 'PIECE', 'SET', 'PRODUCT']),
    minQuantity: z.number().nonnegative(),
    whitesApplicable: z.boolean(),
    prices: z.array(z.object({ washModeId: z.number(), price: money })),
  }) satisfies z.ZodType<PublicService>,
)

export const publicWashModesSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    completionHours: z.number(),
    isDefault: z.boolean(),
  }) satisfies z.ZodType<PublicWashMode>,
)

export const publicServiceAreasSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    pickupFee: money,
    deliveryFee: money,
  }) satisfies z.ZodType<PublicServiceArea>,
)

/** Số lượng kiểm theo đơn vị của dịch vụ đang chọn; chưa chọn thì theo kg (nới nhất). */
export const estimateFormSchema = (services: readonly PublicService[]) =>
  z.custom<EstimateInput>().superRefine((values, ctx) => {
    const pick = rematch(values.service, services)
    const unit = pick ? services[pick.index].unit : 'KG'
    const message = validateQuantity(values.quantity, unit)
    if (message) ctx.addIssue({ code: 'custom', path: ['quantity'], message })
  })
