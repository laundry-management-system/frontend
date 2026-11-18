import { useMutation } from '@tanstack/react-query'
import { customerAuthApi } from '../../data/customerAuthApi'
import { normalizePhone } from '../../domain/identifier'
import type { RegisterValues } from '../schemas'

export function useRegister() {
  return useMutation({
    mutationFn: (v: RegisterValues) =>
      customerAuthApi.register({
        fullName: v.fullName.trim(),
        phone: normalizePhone(v.phone) ?? v.phone,
        email: v.email.trim() || null,
        password: v.password,
      }),
  })
}
