import { useMutation } from '@tanstack/react-query'
import { toApiError } from '@/shared/api/apiError'
import { authApi } from '../data/authApi'
import { classifySetupPasswordError } from '../domain/rules'

export function useSetupPassword() {
  const mutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.setupPassword(token, password),
  })
  return {
    setup: mutation.mutate,
    isPending: mutation.isPending,
    failure: mutation.error ? classifySetupPasswordError(toApiError(mutation.error)) : null,
  }
}
