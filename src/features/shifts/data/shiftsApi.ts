import { httpClient } from '@/shared/api/httpClient'
import { fromSpringPage, type SpringPage } from '@/shared/api/page'
import type { CloseShiftInput, OpenShiftInput, ShiftListParams } from '../domain/types'
import type {
  CurrentShiftResponseDto,
  ShiftDetailDto,
  ShiftRowDto,
  ShiftSummaryDto,
  ShiftTransactionDto,
} from './dto'
import {
  toCurrentShiftState,
  toShiftDetail,
  toShiftRow,
  toShiftSummary,
  toShiftTransaction,
} from './mapper'

export const shiftsApi = {
  current: async () =>
    toCurrentShiftState((await httpClient.get<CurrentShiftResponseDto>('/shifts/current')).data),

  open: async (body: OpenShiftInput) =>
    toShiftDetail((await httpClient.post<ShiftDetailDto>('/shifts', body)).data),

  list: async (params: ShiftListParams) =>
    fromSpringPage(
      (await httpClient.get<SpringPage<ShiftRowDto>>('/shifts', { params })).data,
      toShiftRow,
    ),

  summary: async (range: { from: string; to: string }) =>
    toShiftSummary(
      (await httpClient.get<ShiftSummaryDto>('/shifts/summary', { params: range })).data,
    ),

  get: async (id: number) =>
    toShiftDetail((await httpClient.get<ShiftDetailDto>(`/shifts/${id}`)).data),

  transactions: async (id: number, params: { page: number; size: number }) =>
    fromSpringPage(
      (
        await httpClient.get<SpringPage<ShiftTransactionDto>>(`/shifts/${id}/transactions`, {
          params,
        })
      ).data,
      toShiftTransaction,
    ),

  close: async (id: number, body: CloseShiftInput) =>
    toShiftDetail((await httpClient.post<ShiftDetailDto>(`/shifts/${id}/close`, body)).data),

  approve: async (id: number, body: { note?: string }) =>
    toShiftDetail((await httpClient.post<ShiftDetailDto>(`/shifts/${id}/approve`, body)).data),
}
