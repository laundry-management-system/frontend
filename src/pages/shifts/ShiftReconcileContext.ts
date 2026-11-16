import { createContext, useContext } from 'react'
import type { ShiftReconcile } from './useShiftReconcile'

/** Số liệu và thao tác đối chiếu ca, dùng chung cho các section của trang kết ca / duyệt ca */
export const ShiftReconcileContext = createContext<ShiftReconcile | null>(null)

export function useShiftReconcileContext() {
  const ctx = useContext(ShiftReconcileContext)
  if (!ctx)
    throw new Error('useShiftReconcileContext phải nằm trong ShiftReconcileContext.Provider')
  return ctx
}
