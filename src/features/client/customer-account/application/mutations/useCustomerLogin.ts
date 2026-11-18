import { useMutation } from '@tanstack/react-query'
import { customerAuthApi } from '../../data/customerAuthApi'
import { useCustomerSessionStore } from '../sessionStore'
import type { LoginValues } from '../schemas'

export function useCustomerLogin() {
  return useMutation({
    mutationFn: ({ identifier, password }: LoginValues) =>
      customerAuthApi.login({ identifier: identifier.trim(), password }),
    onSuccess: (token) => useCustomerSessionStore.getState().setSession(token),
  })
}
