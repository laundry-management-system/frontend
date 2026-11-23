import { Group, Select, type SelectProps, Stack, Table, Text, UnstyledButton } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { useState } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'
import { EntityCode, IconButton, MoneyInput } from '@/shared/admin/ui'
import type { WashModeFormValues } from '../application/schemas'
import { type Service, UNIT_LABEL } from '../domain/types'

const BOX = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--radius-control)',
  overflow: 'hidden',
} as const

const ADD_ROW = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
  border: '1px dashed var(--ds-border)',
  borderRadius: 'var(--radius-control)',
  color: 'var(--mantine-color-dimmed)',
} as const

interface ServicePriceTableProps {
  form: UseFormReturnType<WashModeFormValues>
  services: Service[]
  /** Hình thức đang sửa; không có khi thêm mới */
  modeId?: number
}

/** Bảng dịch vụ + giá của một hình thức: chỉ liên kết dịch vụ có sẵn (FR-001c, FR-036). */
export function ServicePriceTable({ form, services, modeId }: ServicePriceTableProps) {
  const [adding, setAdding] = useState(false)
  const rows = form.values.services
  const byId = new Map(services.map((s) => [s.id, s]))
  const options = services
    .filter((s) => !rows.some((r) => r.serviceId === s.id))
    .map((s) => ({ value: String(s.id), label: `${s.code} ${s.name}` }))
  const nothingFound = options.length ? 'Không tìm thấy dịch vụ' : 'Đã thêm tất cả dịch vụ'
  const openPicker = () => setAdding(true)
  const closePicker = () => setAdding(false)
  const renderOption: SelectProps['renderOption'] = ({ option }) => {
    const s = byId.get(Number(option.value))!
    return (
      <Group gap="xs" wrap="nowrap">
        <EntityCode code={s.code} size="sm" />
        <Text size="sm">{s.name}</Text>
      </Group>
    )
  }

  const add = (value: string | null) => {
    setAdding(false)
    if (value) form.insertListItem('services', { serviceId: Number(value), price: '' })
  }

  // Bỏ liên kết làm dịch vụ không còn hình thức nào thì chặn ngay tại hàng (FR-001d)
  const remove = (i: number) => {
    const s = byId.get(rows[i].serviceId)
    const lastMode = s?.prices.length === 1 && s.prices[0].washModeId === modeId
    if (lastMode)
      form.setFieldError(
        `services.${i}.serviceId`,
        'Không thể bỏ: đây là hình thức duy nhất của dịch vụ này',
      )
    else form.removeListItem('services', i)
  }

  return (
    <Stack gap="xs">
      {rows.length > 0 && (
        <div style={BOX}>
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={90}>Mã</Table.Th>
                <Table.Th>Tên dịch vụ</Table.Th>
                <Table.Th w={80}>Đơn vị</Table.Th>
                <Table.Th w={150} ta="right">
                  Giá
                </Table.Th>
                <Table.Th w={44} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r, i) => {
                const s = byId.get(r.serviceId)
                const rowError = form.errors[`services.${i}.serviceId`]
                return (
                  <Table.Tr key={r.serviceId}>
                    <Table.Td>{s ? <EntityCode code={s.code} size="sm" /> : '—'}</Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {s?.name ?? `Dịch vụ #${r.serviceId}`}
                      </Text>
                      {rowError && (
                        <Text size="xs" c="error" role="alert">
                          {rowError}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{s?.unit ? UNIT_LABEL[s.unit] : '—'}</Table.Td>
                    <Table.Td>
                      <MoneyInput
                        size="xs"
                        aria-label={`Giá ${s?.name ?? ''}`}
                        {...form.getInputProps(`services.${i}.price`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <IconButton
                        label="Bỏ dịch vụ"
                        size="sm"
                        icon={<LuX size={16} />}
                        onClick={() => remove(i)}
                      />
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </div>
      )}
      {adding ? (
        <Select
          aria-label="Chọn dịch vụ"
          placeholder="Tìm theo mã hoặc tên dịch vụ"
          data={options}
          searchable
          defaultDropdownOpened
          autoFocus
          value={null}
          onChange={add}
          renderOption={renderOption}
          onDropdownClose={closePicker}
          nothingFoundMessage={nothingFound}
        />
      ) : (
        <UnstyledButton style={ADD_ROW} onClick={openPicker}>
          <LuPlus size={16} />
          <Text size="sm" fw={500} span>
            Thêm dịch vụ
          </Text>
        </UnstyledButton>
      )}
    </Stack>
  )
}
