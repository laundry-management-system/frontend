import { useMutation } from '@tanstack/react-query'
import { customerAuthApi } from '../../data/customerAuthApi'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => customerAuthApi.forgotPassword(email.trim()),
  })
}
