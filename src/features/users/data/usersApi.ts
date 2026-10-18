import { httpClient } from '@/shared/api/httpClient'
import type { PageResult } from '@/shared/types/api'
import type { User, UserStatus } from '../domain/types'
import type { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from './dto'
import { toUser } from './mapper'

export interface ListUsersParams {
  keyword?: string
  status?: UserStatus
  page: number
  size: number
}

interface SpringPageDto<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export const usersApi = {
  list: async (params: ListUsersParams): Promise<PageResult<User>> => {
    const { data } = await httpClient.get<SpringPageDto<UserResponseDto>>('/users', {
      params: { ...params, sort: 'fullName' },
    })
    return {
      content: data.content.map(toUser),
      page: {
        number: data.number,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      },
    }
  },
  create: async (dto: CreateUserRequestDto) =>
    toUser((await httpClient.post<UserResponseDto>('/users', dto)).data),
  update: async (id: number, dto: UpdateUserRequestDto) =>
    toUser((await httpClient.patch<UserResponseDto>(`/users/${id}`, dto)).data),
  disable: async (id: number) => {
    await httpClient.delete(`/users/${id}`)
  },
  enable: async (id: number) => {
    await httpClient.post(`/users/${id}/enable`)
  },
}
