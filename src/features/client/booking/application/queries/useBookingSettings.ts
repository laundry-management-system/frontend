import { useQuery } from '@tanstack/react-query'
import { bookingApi } from '../../data/bookingApi'
import { bookingKeys } from '../queryKeys'
import { bookingSettingsSchema } from '../schemas'

export function useBookingSettings() {
  return useQuery({
    queryKey: bookingKeys.settings(),
    queryFn: async () => bookingSettingsSchema.parse(await bookingApi.getBookingSettings()),
    staleTime: 60_000,
    retry: 1,
  })
}
