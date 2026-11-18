import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import { registrationsApi } from '../data/registrationsApi'
import { customerKeys, registrationKeys } from './queryKeys'

export function usePendingRegistrationCount() {
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  return useQuery({
    queryKey: registrationKeys.count(),
    queryFn: registrationsApi.pendingCount,
    enabled: isAdmin,
    refetchInterval: 60_000,
  })
}

function useInvalidateRegistrations() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: registrationKeys.all }),
      queryClient.invalidateQueries({ queryKey: customerKeys.all }),
    ])
}

export function useActivateRegistration() {
  const invalidate = useInvalidateRegistrations()
  return useMutation({
    mutationFn: (id: number) => registrationsApi.activate(id),
    onSuccess: invalidate,
  })
}

export function useRejectRegistration() {
  const invalidate = useInvalidateRegistrations()
  return useMutation({
    mutationFn: (id: number) => registrationsApi.reject(id),
    onSuccess: invalidate,
  })
}
