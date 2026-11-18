import { z } from 'zod'
import { affectedCountError, amountError, compensationOf } from '../domain/rules'
import type { CompensationContext, IncidentFormValues } from '../domain/types'

// NumberInput của Mantine trả '' khi ô trống
const numberOrBlank = z.union([z.number(), z.literal('')])

export function incidentFormSchema(ctx: CompensationContext) {
  return z
    .object({
      orderItemId: z.string().nullable(),
      affectedCount: numberOrBlank,
      type: z.enum(['LOST', 'TORN', 'FADED', 'SHRUNK', 'OTHER']).nullable(),
      description: z.string(),
      resolution: z.enum(['REWASH', 'DISCOUNT', 'COMPENSATION']).nullable(),
      amount: numberOrBlank,
      images: z
        .array(z.object({ id: z.number(), imageUrl: z.string() }))
        .max(6, 'Tối đa 6 ảnh hiện tại'),
    })
    .superRefine((v, c) => {
      const issue = (path: keyof IncidentFormValues, message: string) =>
        c.addIssue({ code: 'custom', path: [path], message })
      if (!v.type) issue('type', 'Chọn loại sự cố')
      if (!v.resolution) issue('resolution', 'Chọn phương án xử lý')
      const description = v.description.trim()
      if (!description) issue('description', 'Nhập mô tả sự cố')
      else if (description.length > 1000) issue('description', 'Mô tả tối đa 1000 ký tự')

      const selected = compensationOf(ctx, v.orderItemId, v.affectedCount)
      if (!selected && (v.resolution === 'DISCOUNT' || v.resolution === 'COMPENSATION'))
        issue('orderItemId', 'Chọn món đồ liên quan')
      if (selected) {
        const countError = affectedCountError(
          selected.item.unit,
          selected.item.quantity,
          v.affectedCount,
        )
        if (countError) issue('affectedCount', countError)
      }
      const amount = amountError(
        v.resolution,
        v.amount,
        selected?.item.lineTotal ?? null,
        selected?.max ?? 0,
      )
      if (amount) issue('amount', amount)
    })
}
