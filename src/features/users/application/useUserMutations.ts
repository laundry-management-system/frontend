import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateUserRequestDto, UpdateUserRequestDto } from '../data/dto'
import { usersApi } from '../data/usersApi'
import { userKeys } from './queryKeys'

function useInvalidateUsers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all })
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (dto: CreateUserRequestDto) => usersApi.create(dto),
    onSuccess: invalidate,
  })
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateUserRequestDto }) =>
      usersApi.update(id, dto),
    onSuccess: invalidate,
  })
}

export function useDisableUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: (id: number) => usersApi.disable(id), onSuccess: invalidate })
}

export function useEnableUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: (id: number) => usersApi.enable(id), onSuccess: invalidate })
}
