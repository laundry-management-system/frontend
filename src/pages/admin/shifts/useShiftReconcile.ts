import { useForm } from '@mantine/form'
import { useCallback, useRef, useState } from 'react'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import {
  canClose,
  countedDenominations,
  type DenominationCounts,
  denominationTotal,
  difference,
  handIn,
  type ShiftDetail,
  useCloseShift,
} from '@/features/admin/shifts'
import { useMe } from '@/features/admin/users'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'

/** `close`: nhân viên / Admin kết ca (nhập liệu). `approve`: Admin xem lại ca và duyệt (chỉ đọc). */
export type ShiftPageMode = 'close' | 'approve'

interface CloseValues {
  differenceReason: string
  /** Tổng tiền về trong app ngân hàng */
  bankTotal: number | ''
  transferReason: string
  closeOnBehalfReason: string
}

/**
 * Số liệu đối chiếu của một ca cho cả hai chế độ: kết ca lấy từ form đang nhập,
 * duyệt ca lấy từ số đã chụp lúc kết. Các section chỉ đọc giá trị đã tính sẵn.
 */
export function useShiftReconcile(
  mode: ShiftPageMode,
  shift: ShiftDetail,
  onClosed: (s: ShiftDetail) => void,
) {
  const editable = mode === 'close'
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))
  const { data: me } = useMe()
  const close = useCloseShift(shift.id)
  const [countsInput, setCountsInput] = useState<DenominationCounts>({})
  const [keepInput, setKeepInput] = useState<DenominationCounts>({})
  // Dùng chung: nút ở bước 2 mở bảng giao dịch, nút Kết ca ở tóm tắt mở hộp xác nhận
  const [txnsOpen, setTxnsOpen] = useState(!editable)
  const [confirming, setConfirming] = useState(false)
  const txnsRef = useRef<HTMLDivElement>(null)
  const form = useForm<CloseValues>({
    initialValues: {
      differenceReason: '',
      bankTotal: '',
      transferReason: '',
      closeOnBehalfReason: '',
    },
  })
  const v = form.values

  const counts = editable ? countsInput : (shift.denominations ?? {})
  const keepCounts = editable ? keepInput : (shift.keepDenominations ?? {})
  // Thực đếm luôn là tổng theo mệnh giá; chưa nhập tờ nào thì coi như chưa đếm
  const counted = editable
    ? Object.values(countsInput).some((n) => n)
      ? denominationTotal(countsInput)
      : null
    : shift.countedCash
  const diff = editable
    ? counted === null
      ? null
      : difference(counted, shift.expectedCash)
    : (shift.difference ?? 0)
  const bankTotal = editable ? v.bankTotal : (shift.bankTotal ?? shift.transferTotal)
  // Ca kết trước khi lưu chênh lệch chuyển khoản: coi như khớp
  const transferDiff = editable
    ? v.bankTotal === ''
      ? null
      : v.bankTotal - shift.transferTotal
    : (shift.transferDifference ?? 0)
  const keepCash = editable ? denominationTotal(keepInput) : (shift.keepCash ?? 0)
  const handInAmount = editable
    ? counted === null
      ? null
      : handIn(counted, keepCash)
    : shift.handInCash
  const differenceReason = editable ? v.differenceReason : (shift.differenceReason ?? '')
  const transferReason = editable ? v.transferReason : (shift.transferDifferenceReason ?? '')
  const onBehalf = editable
    ? me != null && me.id !== shift.openedById
    : shift.closedById != null && shift.closedById !== shift.openedById

  const check = canClose({
    counted: counted ?? '',
    expected: shift.expectedCash,
    bankReconciled: true,
    differenceReason,
    keep: keepCash,
    onBehalf,
    onBehalfReason: v.closeOnBehalfReason,
    transfer: { bankTotal, systemTotal: shift.transferTotal, reason: transferReason },
  })
  const done = {
    cash: counted !== null && (diff === 0 || differenceReason.trim() !== ''),
    transfer: transferDiff === 0 || (transferDiff !== null && transferReason.trim() !== ''),
    handover: counted !== null && (!editable || !onBehalf || v.closeOnBehalfReason.trim() !== ''),
  }

  // Đếm lại ít tờ hơn thì số tờ để lại két không được vượt số mới.
  // useCallback: truyền vào DenominationTable (memo), chỉ dùng setter nên không có dependency
  const changeCounts = useCallback((next: DenominationCounts) => {
    setCountsInput(next)
    setKeepInput((keep) =>
      Object.fromEntries(
        Object.entries(keep).map(([d, n]) => [d, Math.min(n ?? 0, next[Number(d)] ?? 0)]),
      ),
    )
  }, [])
  const toggleTxns = () => setTxnsOpen((o) => !o)
  const showTransfers = () => {
    setTxnsOpen(true)
    requestAnimationFrame(() =>
      txnsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }
  const askConfirm = () => setConfirming(true)
  const closeConfirm = () => setConfirming(false)

  const submit = () =>
    close.mutate(
      {
        expectedCash: shift.expectedCash,
        countedCash: counted ?? 0,
        denominations: countedDenominations(countsInput),
        ...(diff !== 0 && { differenceReason: v.differenceReason.trim() }),
        bankReconciled: true,
        bankTotal: Number(v.bankTotal),
        ...(transferDiff !== null &&
          transferDiff !== 0 && { transferDifferenceReason: v.transferReason.trim() }),
        keepCash,
        keepDenominations: countedDenominations(keepInput),
        ...(onBehalf && { closeOnBehalfReason: v.closeOnBehalfReason.trim() }),
      },
      {
        onSuccess: (result) => {
          notify.success(`Đã kết ca ${result.code}`)
          onClosed(result)
        },
        onError: (err) => {
          const e = toApiError(err)
          setConfirming(false)
          if (Object.keys(e.fieldErrors).some((key) => key in v)) form.setErrors(e.fieldErrors)
          else notify.error(e.message)
        },
      },
    )

  return {
    mode,
    editable,
    shift,
    form,
    /** Nhân viên mở trang kết ca của người khác: không được kết */
    forbidden: editable && !isAdmin && onBehalf,
    counts,
    countsInput,
    keepCounts,
    counted,
    diff,
    bankTotal,
    transferDiff,
    keepCash,
    handInAmount,
    differenceReason,
    transferReason,
    onBehalf,
    missing: check.reasons,
    done,
    changeCounts,
    changeKeep: setKeepInput,
    txnsOpen,
    txnsRef,
    toggleTxns,
    showTransfers,
    confirming,
    askConfirm,
    closeConfirm,
    submit,
    closing: close.isPending,
  }
}

export type ShiftReconcile = ReturnType<typeof useShiftReconcile>
