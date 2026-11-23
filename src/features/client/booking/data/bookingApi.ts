import { customerHttpClient, httpClient } from '@/shared/common/api/httpClient'

// Trả dữ liệu thô; zod parse ở application/schemas.
export const bookingApi = {
  getBookingSettings: async () => (await httpClient.get<unknown>('/public/booking-settings')).data,
  createBookingIntake: async (body: unknown) =>
    (await customerHttpClient.post<unknown>('/customer-portal/bookings/intake', body)).data,
}
