import { Button, Group, Text, TextInput } from '@mantine/core'
import dayjs from 'dayjs'
import { useState } from 'react'
import { formatMoney } from '@/shared/common/lib/format'
import {
  checkVoucher,
  useAppliedVoucher,
  useLookupVoucher,
  voucherReasonText,
} from '@/features/admin/vouchers'

interface VoucherFieldProps {
  /** Mã đang áp; mỗi đơn tối đa một voucher (BR-G04) */
  appliedCode: string | null
  subtotal: number
  onApply: (code: string | null) => void
  pending?: boolean
}

const LOOKUP_FAILED = 'Không kiểm tra được mã, thử lại'

export function VoucherField({
  appliedCode,
  subtotal,
  onApply,
  pending = false,
}: VoucherFieldProps) {
  const [input, setInput] = useState(appliedCode ?? '')
  const [error, setError] = useState<string>()
  const lookup = useLookupVoucher()
  const applied = useAppliedVoucher(appliedCode, subtotal)
  const busy = lookup.isPending || pending

  const apply = () => {
    const code = input.trim().toUpperCase()
    setError(undefined)
    if (!code) return onApply(null)
    lookup.mutate(code, {
      onSuccess: (voucher) => {
        const check = checkVoucher(voucher, subtotal, dayjs().format('YYYY-MM-DD'))
        // Mã mới hợp lệ thì thay mã cũ; mã sai thì giữ nguyên mã đang áp
        if (check.ok) onApply(code)
        else setError(voucherReasonText(check.reason, voucher))
      },
      onError: () => setError(LOOKUP_FAILED),
    })
  }

  const appliedError = applied.failed
    ? `${LOOKUP_FAILED} – tạm không giảm giá`
    : applied.check && !applied.check.ok
      ? `${voucherReasonText(applied.check.reason, applied.voucher)} – tạm không giảm giá`
      : undefined

  return (
    <Group gap="xs" align="flex-start" wrap="nowrap">
      <TextInput
        label="Mã voucher"
        placeholder="GIAT10"
        style={{ flex: 1 }}
        value={input}
        disabled={busy}
        onChange={(e) => {
          setInput(e.currentTarget.value)
          setError(undefined)
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          if (!busy) apply()
        }}
        error={error ?? appliedError}
        description={
          applied.voucher && applied.check?.ok ? (
            <Text span size="xs" c="success">
              ✓ Giảm {formatMoney(applied.check.discount)}
            </Text>
          ) : undefined
        }
      />
      <Button variant="secondary" mt={25} onClick={apply} loading={busy}>
        Áp dụng
      </Button>
      {appliedCode && (
        <Button
          variant="subtle"
          mt={25}
          disabled={busy}
          onClick={() => {
            setInput('')
            setError(undefined)
            onApply(null)
          }}
        >
          Gỡ
        </Button>
      )}
    </Group>
  )
}
