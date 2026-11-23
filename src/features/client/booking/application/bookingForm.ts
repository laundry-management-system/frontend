import { useEffect, useRef, useState } from 'react'
import { createFormContext } from '@mantine/form'
import { draftStorage } from '../data/draftStorage'
import { notify } from '@/shared/common/lib/notify'
import { emptyDraft, gapHoursOf, itemsForTier, pruneDraft, type BookingStep } from '../domain/draft'
import type { BookingDraft, BookingSettings } from '../domain/types'

export const [BookingFormProvider, useBookingFormContext, useBookingFormBase] =
  createFormContext<BookingDraft>()

interface Profile {
  customerCode: string
  fullName: string
  phone: string
  address: string | null
}

interface Options {
  profile: Profile | undefined
  services: readonly { id: number; expressSupported: boolean; whitesApplicable: boolean }[] | undefined
  areas: readonly { id: number }[] | undefined
  settings: BookingSettings | undefined
  store: { openingTime: string; closingTime: string } | undefined
}

export function useBookingForm({ profile, services, areas, settings, store }: Options) {
  const [stored] = useState(draftStorage.load)
  const form = useBookingFormBase({ initialValues: stored?.values ?? emptyDraft() })
  const [step, setStep] = useState<BookingStep>(stored?.step ?? 1)
  const meta = useRef({ owner: stored?.owner ?? null, prefilled: stored?.prefilled ?? false })

  // form.reset() sau khi gửi phải về form trống, không về bản nháp đã nạp.
  useEffect(() => form.setInitialValues(emptyDraft()), []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profile) return
    const m = meta.current
    const otherOwner = m.owner !== null && m.owner !== profile.customerCode
    if (!otherOwner && m.prefilled && m.owner !== null) return
    let v = form.getValues()
    if (otherOwner) {
      v = emptyDraft()
      m.prefilled = false
      setStep(1)
    }
    if (!m.prefilled) {
      // Chỉ điền ô trống: khách gõ trước khi hồ sơ tải xong thì giữ nguyên.
      v = {
        ...v,
        contactName: v.contactName || profile.fullName,
        contactPhone: v.contactPhone || profile.phone,
        pickupAddress: v.pickupAddress || (profile.address ?? ''),
      }
    }
    meta.current = { owner: profile.customerCode, prefilled: true }
    form.setValues(v)
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!services || !areas || !settings || !store) return
    const v = form.getValues()
    const rules = { open: store.openingTime, close: store.closingTime, gapHours: gapHoursOf(settings, v.orderType) }
    const expressIds = services.filter((s) => s.expressSupported).map((s) => s.id)
    const pruned = pruneDraft(v, services.map((s) => s.id), areas.map((a) => a.id), settings.deliveryEnabled, rules, expressIds, services.filter((s) => s.whitesApplicable).map((s) => s.id))
    if (pruned !== v) {
      form.setValues(pruned)
      if (itemsForTier(v.items, v.orderType, expressIds).length < v.items.length) {
        notify.warning('Một số dịch vụ không hỗ trợ giặt nhanh đã được bỏ khỏi lựa chọn')
      } else if (pruned.items.length < v.items.length) {
        notify.warning('Một số dịch vụ đã ngừng kinh doanh và đã được bỏ khỏi lựa chọn')
      }
    }
    // Đổi giờ gửi đồ phải xoá giờ nhận lại không còn hợp lệ.
  }, [services, areas, settings, store, form.values.appointmentDate, form.values.appointmentHour, form.values.items, form.values.orderType]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    draftStorage.save({ values: form.values, step, ...meta.current })
  }, [form.values, step])

  return { form, step, setStep }
}
