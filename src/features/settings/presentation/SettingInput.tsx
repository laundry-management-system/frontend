import { Group, NumberInput, Select, Text, Textarea, TextInput } from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import type { ChangeEvent } from 'react'
import { formatMoney } from '@/shared/lib/format'
import { MoneyInput } from '@/shared/ui'
import { bankOptions } from '../domain/banks'
import type { SettingField } from '../domain/types'

interface SettingInputProps {
  field: SettingField
  value: string
  error?: string
  editing: boolean
  onChange: (value: string) => void
}

const LEFT_ALIGNED = { input: { textAlign: 'left' as const } }
const VALUE_STYLE = {
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'pre-line',
  overflowWrap: 'anywhere',
} as const

function displayValue(field: SettingField, value: string) {
  switch (field.type) {
    case 'NON_NEGATIVE_INT':
      return formatMoney(Number(value))
    case 'POSITIVE_INT':
      return field.unit ? `${value} ${field.unit}` : value
    case 'BANK':
      return bankOptions(value).find((o) => o.value === value)?.label ?? value
    default:
      return value
  }
}

export function SettingInput({ field, value, error, editing, onChange }: SettingInputProps) {
  const handleText = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(e.currentTarget.value)
  const handleNumber = (v: number | string) => onChange(v === '' ? '' : String(v))
  const handleSelect = (v: string | null) => onChange(v ?? '')

  const common = { label: field.label, error, required: true }
  const numberValue = value === '' ? '' : Number(value)

  // Một dòng nhãn – giá trị, cùng kiểu InfoRow ở trang chi tiết đơn
  const view = (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
      <Text size="sm" c="dimmed">
        {field.label}
      </Text>
      <Text fw={500} ta="right" maw="60%" style={VALUE_STYLE}>
        {value ? displayValue(field, value) : '—'}
      </Text>
    </Group>
  )

  const input = (() => {
    if (!editing) return view
    switch (field.type) {
      case 'TIME':
        return <TimeInput {...common} value={value} onChange={handleText} />
      case 'POSITIVE_INT':
        return (
          <NumberInput
            {...common}
            value={numberValue}
            onChange={handleNumber}
            allowDecimal={false}
            allowNegative={false}
            rightSection={field.unit}
            rightSectionWidth={56}
          />
        )
      case 'NON_NEGATIVE_INT':
        return (
          <MoneyInput
            {...common}
            value={numberValue}
            onChange={handleNumber}
            styles={LEFT_ALIGNED}
          />
        )
      case 'BANK':
        return (
          <Select
            {...common}
            searchable
            data={bankOptions(value)}
            value={value || null}
            onChange={handleSelect}
          />
        )
      case 'STRING':
        return field.multiline ? (
          <Textarea {...common} autosize minRows={3} value={value} onChange={handleText} />
        ) : (
          <TextInput {...common} value={value} onChange={handleText} />
        )
    }
  })()

  return input
}
