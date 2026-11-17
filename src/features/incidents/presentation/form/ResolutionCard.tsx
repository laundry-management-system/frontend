import { Box, Card, Group, Select, Stack, Text, Title } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { ReactNode } from 'react'
import { formatMoney } from '@/shared/lib/format'
import { InfoLabel, MoneyInput } from '@/shared/ui'
import { formulaText, unitPriceLabel } from '../../domain/rules'
import {
  RESOLUTION_LABEL,
  type IncidentFormValues,
  type IncidentResolution,
  type IncidentUnit,
} from '../../domain/types'
import { RESOLUTION_OPTIONS, renderResolutionOption } from './resolutionOptions'

const BOX_STYLE = {
  background: 'var(--mantine-color-gray-0)',
  borderRadius: 'var(--mantine-radius-sm)',
}

export interface ResolutionLimit {
  unit: IncidentUnit
  unitPrice: number
  affected: number
  max: number
  lineTotal: number | null
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="xs">
      <Text size="sm" fw={strong ? 600 : undefined}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : undefined} style={{ whiteSpace: 'nowrap' }}>
        {value}
      </Text>
    </Group>
  )
}

function LimitBox({
  resolution,
  limit,
  multiplier,
  cap,
}: {
  resolution: 'DISCOUNT' | 'COMPENSATION'
  limit: ResolutionLimit | null
  multiplier: number
  cap: number
}) {
  if (!limit)
    return (
      <Text size="sm" c="dimmed">
        Chọn món đồ liên quan để tính mức tối đa.
      </Text>
    )
  return (
    <Box p="sm" style={BOX_STYLE}>
      <Stack gap={6}>
        <Row label="Giá dịch vụ của món" value={unitPriceLabel(limit.unitPrice, limit.unit)} />
        {resolution === 'DISCOUNT' ? (
          <Row
            label="Giảm tối đa (thành tiền dòng)"
            value={formatMoney(limit.lineTotal ?? 0)}
            strong
          />
        ) : (
          <>
            <Row label="Bồi thường tối đa" value={formatMoney(limit.max)} strong />
            <Text size="xs" c="dimmed">
              {formulaText(limit.affected, multiplier, limit.unitPrice, cap)}
            </Text>
          </>
        )}
      </Stack>
    </Box>
  )
}

export function ResolutionCard({
  form,
  limit,
  multiplier,
  cap,
  readOnly,
  children,
}: {
  form: UseFormReturnType<IncidentFormValues>
  limit: ResolutionLimit | null
  multiplier: number
  cap: number
  readOnly: boolean
  /** Nút lưu bên dưới */
  children?: ReactNode
}) {
  const { resolution } = form.values
  const resolutionProps = form.getInputProps('resolution')
  const handleResolutionChange = (value: string | null) => {
    const next = value as IncidentResolution | null
    form.setFieldValue('resolution', next)
    if (next === 'REWASH') form.setFieldValue('amount', 0)
  }
  const amountLabel = (
    <InfoLabel info="Chủ tiệm thương lượng trực tiếp với khách; hệ thống chỉ ghi kết quả.">
      {resolution === 'DISCOUNT' ? 'Số tiền giảm' : 'Số tiền bồi thường'}
    </InfoLabel>
  )

  const limitBox = (resolution === 'DISCOUNT' || resolution === 'COMPENSATION') && (
    <LimitBox resolution={resolution} limit={limit} multiplier={multiplier} cap={cap} />
  )

  if (readOnly)
    return (
      <Card>
        <Stack gap="md">
          <Title order={5}>Phương án đề xuất</Title>
          <Row label="Phương án" value={resolution ? RESOLUTION_LABEL[resolution] : ''} />
          {resolution !== 'REWASH' && (
            <Row
              label={resolution === 'DISCOUNT' ? 'Số tiền giảm' : 'Số tiền bồi thường'}
              value={formatMoney(typeof form.values.amount === 'number' ? form.values.amount : 0)}
              strong
            />
          )}
          {limitBox}
          {children}
        </Stack>
      </Card>
    )

  return (
    <Card>
      <Stack gap="md">
        <Title order={5}>Phương án xử lý</Title>
        <Select
          label="Phương án"
          placeholder="Chọn phương án"
          required
          data={RESOLUTION_OPTIONS}
          value={resolution}
          onChange={handleResolutionChange}
          error={resolutionProps.error}
          renderOption={renderResolutionOption}
        />
        {(resolution === 'DISCOUNT' || resolution === 'COMPENSATION') && (
          <>
            {limitBox}
            <MoneyInput label={amountLabel} min={0} {...form.getInputProps('amount')} />
          </>
        )}
        {children}
      </Stack>
    </Card>
  )
}
