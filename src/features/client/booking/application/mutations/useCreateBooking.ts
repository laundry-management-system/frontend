import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { bookingApi } from '../../data/bookingApi'
import { draftStorage } from '../../data/draftStorage'
import { toIntakeRequest } from '../../domain/draft'
import type { BookingDraft, BookingService } from '../../domain/types'
import { bookingIntakeSchema } from '../schemas'

/** Lỗi 400/401/429/5xx do caller xử lý theo contract §3; chỉ 201 mới xóa bản nháp. */
export function useCreateBooking() {
  // requestId giữ nguyên khi gửi lại cùng nội dung (idempotent); đổi khi nháp bị sửa hoặc sau khi thành công.
  const request = useRef<{ id: string; key: string } | null>(null)
  return useMutation({
    mutationFn: async ({ values, services }: { values: BookingDraft; services: readonly BookingService[] }) => {
      const key = JSON.stringify(values)
      if (request.current?.key !== key) request.current = { id: crypto.randomUUID(), key }
      return bookingIntakeSchema.parse(
        await bookingApi.createBookingIntake(toIntakeRequest(values, request.current.id, services)),
      )
    },
    onSuccess: () => {
      request.current = null
      draftStorage.clear()
    },
  })
}
