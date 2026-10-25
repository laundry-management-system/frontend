import {
  Alert,
  Anchor,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import type { UseQueryResult } from '@tanstack/react-query'
import { type ChangeEvent, useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { CopyableCode, MoneyInput } from '@/shared/ui'
import { formatMoney } from '@/shared/lib/format'
import { changeDue } from '../../domain/payment'
import type { PaymentMethod, VietQr } from '../../domain/types'
import { InfoRow } from '../InfoRow'

export interface PaymentValue {
  method: PaymentMethod
  given: number | ''
  referenceCode: string
}

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

const METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản (QR)' },
]

/** Phần thu tiền (tiền mặt / QR) của màn thanh toán; trạng thái do màn cha giữ. */
export function PaymentFields({
  total,
  value,
  onChange,
  qr,
  onDiscrepancy,
}: {
  total: number
  value: PaymentValue
  onChange: (v: PaymentValue) => void
  qr: UseQueryResult<VietQr>
  onDiscrepancy: () => void
}) {
  const [qrBroken, setQrBroken] = useState(false)
  const change = changeDue(total, value.given)

  const handleMethodChange = (method: string) =>
    onChange({ ...value, method: method as PaymentMethod })
  const handleGivenChange = (v: number | string) =>
    onChange({ ...value, given: typeof v === 'number' ? v : '' })
  const handleReferenceChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, referenceCode: e.currentTarget.value })
  const markQrBroken = () => setQrBroken(true)

  const cash = (
    <Stack gap="sm">
      <Group justify="space-between" wrap="nowrap">
        <Text>Phải thu</Text>
        <Text fw={700} size="lg" style={TABULAR}>
          {formatMoney(total)}
        </Text>
      </Group>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Text mt={8}>Khách đưa</Text>
        <MoneyInput
          aria-label="Khách đưa"
          inThousands
          data-autofocus
          w={220}
          size="md"
          value={value.given}
          onChange={handleGivenChange}
          error={value.given !== '' && change === null ? 'Khách đưa chưa đủ' : undefined}
        />
      </Group>
      <Divider />
      <Group justify="space-between" wrap="nowrap">
        <Text fw={700}>Tiền thối lại</Text>
        <Text fw={700} size="xl" c={change === null ? 'dimmed' : 'success'} style={TABULAR}>
          {change === null ? '—' : formatMoney(change)}
        </Text>
      </Group>
    </Stack>
  )

  const qrInfo = qr.isLoading ? (
    <Center h={220}>
      <Loader />
    </Center>
  ) : qr.error ? (
    <Alert color="danger" title="Chưa tạo được mã QR">
      {toApiError(qr.error).message}
    </Alert>
  ) : qr.data ? (
    <Stack gap="xs">
      {!qrBroken && (
        <Center>
          <Image
            src={qr.data.qrImageUrl}
            alt="Mã QR chuyển khoản"
            w={220}
            h={220}
            fit="contain"
            onError={markQrBroken}
          />
        </Center>
      )}
      <InfoRow label="Ngân hàng">{qr.data.bankId}</InfoRow>
      <InfoRow label="Số tài khoản">
        <CopyableCode code={qr.data.accountNo} size="sm" />
      </InfoRow>
      <InfoRow label="Chủ tài khoản">{qr.data.accountName}</InfoRow>
      <InfoRow label="Nội dung chuyển khoản">
        <CopyableCode code={qr.data.transferContent} size="sm" />
      </InfoRow>
    </Stack>
  ) : null

  const transfer = (
    <Stack gap="sm">
      {qrInfo}
      <TextInput
        label="Mã tham chiếu giao dịch"
        placeholder="Không bắt buộc"
        maxLength={50}
        value={value.referenceCode}
        onChange={handleReferenceChange}
      />
      <Anchor component="button" type="button" size="sm" onClick={onDiscrepancy}>
        Khách chuyển sai số tiền
      </Anchor>
    </Stack>
  )

  return (
    <Stack gap="sm">
      <SegmentedControl
        fullWidth
        data={METHODS}
        value={value.method}
        onChange={handleMethodChange}
      />
      {value.method === 'CASH' ? cash : transfer}
    </Stack>
  )
}
