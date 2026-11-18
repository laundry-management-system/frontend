import { useMutation } from '@tanstack/react-query'
import { customerAuthApi } from '../../data/customerAuthApi'

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      customerAuthApi.resetPassword(token, newPassword),
  })
}
