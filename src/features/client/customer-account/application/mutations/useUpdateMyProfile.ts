import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customerPortalApi } from '../../data/customerPortalApi'
import { toCustomerProfile } from '../../data/mapper'
import { customerKeys } from '../queryKeys'
import type { ProfileValues } from '../schemas'

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (v: ProfileValues) =>
      toCustomerProfile(
        await customerPortalApi.updateMe({
          fullName: v.fullName.trim(),
          email: v.email.trim() || null,
          address: v.address.trim() || null,
        }),
      ),
    onSuccess: (profile) => queryClient.setQueryData(customerKeys.me(), profile),
  })
}
