import { Button, Group, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { checkVoucherCode } from '../../application/voucherCheck'
import { describeVoucher, VOUCHER_REASON_LABEL } from '../../domain/voucher'

interface VoucherFieldProps {
  /** Mã đang áp; mỗi đơn tối đa một voucher (BR-G04) */
  appliedCode: string | null
  subtotal: number
  onApply: (code: string | null) => void
}

export function VoucherField({ appliedCode, subtotal, onApply }: VoucherFieldProps) {
  const [input, setInput] = useState(appliedCode ?? '')
  const [error, setError] = useState<string>()
  const applied = appliedCode ? checkVoucherCode(appliedCode, subtotal) : null

  const apply = () => {
    const code = input.trim().toUpperCase()
    setError(undefined)
    if (!code) return onApply(null)
    const { check } = checkVoucherCode(code, subtotal)
    // Mã mới hợp lệ thì thay mã cũ; mã sai thì giữ nguyên mã đang áp
    if (check.ok) onApply(code)
    else setError(VOUCHER_REASON_LABEL[check.reason])
  }

  return (
    <Group gap="xs" align="flex-start" wrap="nowrap">
      <TextInput
        label="Mã voucher"
        placeholder="GIAT10"
        style={{ flex: 1 }}
        value={input}
        onChange={(e) => {
          setInput(e.currentTarget.value)
          setError(undefined)
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          apply()
        }}
        error={
          error ??
          (applied && !applied.check.ok
            ? `${VOUCHER_REASON_LABEL[applied.check.reason]} – tạm không giảm giá`
            : undefined)
        }
        description={
          applied?.voucher && applied.check.ok ? (
            <Text span size="xs" c="success">
              ✓ {describeVoucher(applied.voucher)}
            </Text>
          ) : undefined
        }
      />
      <Button variant="secondary" mt={25} onClick={apply}>
        Áp dụng
      </Button>
      {appliedCode && (
        <Button
          variant="subtle"
          mt={25}
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
