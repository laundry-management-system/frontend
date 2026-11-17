import type {
  CurrentShiftState,
  ShiftDetail,
  ShiftRow,
  ShiftSummary,
  ShiftTransaction,
} from '../domain/types'
import type {
  CurrentShiftResponseDto,
  ShiftDetailDto,
  ShiftRowDto,
  ShiftSummaryDto,
  ShiftTransactionDto,
} from './dto'

const money = (v: number | string | null): number | null => (v == null ? null : Number(v))

// JSON trả key mệnh giá dạng chuỗi
const toCounts = (v: Record<string, number> | null) =>
  v && Object.fromEntries(Object.entries(v).map(([k, n]) => [Number(k), n]))

export const toCurrentShiftState = (dto: CurrentShiftResponseDto): CurrentShiftState => ({
  current: dto.current,
  previous: dto.previous && { ...dto.previous, keepCash: Number(dto.previous.keepCash) },
})

export const toShiftDetail = (dto: ShiftDetailDto): ShiftDetail => ({
  ...dto,
  openingCash: Number(dto.openingCash),
  suggestedOpeningCash: money(dto.suggestedOpeningCash),
  cashIn: Number(dto.cashIn),
  cashOut: Number(dto.cashOut),
  expectedCash: Number(dto.expectedCash),
  transferTotal: Number(dto.transferTotal),
  countedCash: money(dto.countedCash),
  difference: money(dto.difference),
  denominations: toCounts(dto.denominations),
  keepDenominations: toCounts(dto.keepDenominations),
  bankTotal: money(dto.bankTotal),
  transferDifference: money(dto.transferDifference),
  keepCash: money(dto.keepCash),
  handInCash: money(dto.handInCash),
})

export const toShiftRow = (dto: ShiftRowDto): ShiftRow => ({
  ...dto,
  expectedCash: money(dto.expectedCash),
  countedCash: money(dto.countedCash),
  difference: money(dto.difference),
  transferTotal: money(dto.transferTotal),
  transferDifference: money(dto.transferDifference),
})

export const toShiftSummary = (dto: ShiftSummaryDto): ShiftSummary => ({
  ...dto,
  differenceTotal: Number(dto.differenceTotal),
  handInTotal: Number(dto.handInTotal),
})

export const toShiftTransaction = (dto: ShiftTransactionDto): ShiftTransaction => ({
  ...dto,
  amount: Number(dto.amount),
  incidentCode: dto.incidentCode ?? null,
})
