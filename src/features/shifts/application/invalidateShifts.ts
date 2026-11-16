import type { QueryClient } from '@tanstack/react-query'
import { shiftKeys } from './queryKeys'

/** Mọi thao tác mở / kết / duyệt ca, hoặc 409 do ca đổi ở máy khác, đều làm mới toàn bộ dữ liệu ca */
export const invalidateShifts = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: shiftKeys.all })
