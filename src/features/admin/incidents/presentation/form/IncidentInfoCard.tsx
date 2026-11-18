import { formatPhone } from '@/shared/common/lib/format'
import {
  Avatar,
  Card,
  Divider,
  Grid,
  Group,
  Input,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { ReactNode } from 'react'
import { lineOptionLabel } from '../../domain/rules'
import {
  INCIDENT_TYPE_LABEL,
  INCIDENT_UNIT_LABEL,
  type IncidentFormValues,
} from '../../domain/types'
import type { IncidentOrderView } from './orderView'

const TYPE_OPTIONS = Object.entries(INCIDENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))
const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const

/** Ô chỉ đọc: nhãn + giá trị dạng chữ, thay cho input bị khóa. */
function ReadField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Input.Wrapper label={label}>
      <Text pt={4} style={{ whiteSpace: 'pre-wrap' }}>
        {children}
      </Text>
    </Input.Wrapper>
  )
}

function CustomerField({ name, phone }: { name: string; phone: string }) {
  return (
    <Input.Wrapper label="Khách hàng">
      <Group gap="sm" wrap="nowrap" pt={4}>
        <Avatar name={name} color="initials" radius="xl" />
        <Stack gap={0}>
          <Text fw={600}>{name}</Text>
          <Text size="sm" c="dimmed" style={TABULAR}>
            {formatPhone(phone)}
          </Text>
        </Stack>
      </Group>
    </Input.Wrapper>
  )
}

export function IncidentInfoCard({
  form,
  view,
  orderField,
  customer,
  itemText,
  readOnly,
}: {
  form: UseFormReturnType<IncidentFormValues>
  view: IncidentOrderView | null
  /** Ô đơn liên quan: mã đơn, hoặc ô tra mã khi lập từ danh sách */
  orderField: ReactNode
  /** Khách của đơn; phiếu đã xử lý không tải lại đơn nên lấy từ phiếu */
  customer: { name: string; phone: string } | null
  /** Món đồ liên quan ở dạng chữ khi chỉ đọc (từ bản chụp trên phiếu) */
  itemText?: string
  readOnly: boolean
}) {
  const items = view?.ctx.items ?? []
  const itemOptions = items.map((item, i) => ({
    value: String(item.id),
    label: lineOptionLabel(i, item),
  }))
  const selected = items.find((i) => String(i.id) === form.values.orderItemId)
  const countSuffix =
    selected && selected.unit !== 'KG'
      ? `/ ${selected.quantity} ${INCIDENT_UNIT_LABEL[selected.unit]}`
      : undefined
  const { type, description } = form.values

  const header = (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6 }}>{orderField}</Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        {customer && <CustomerField name={customer.name} phone={customer.phone} />}
      </Grid.Col>
    </Grid>
  )

  if (readOnly) {
    return (
      <Card>
        <Stack gap="md">
          <Title order={5}>Thông tin sự cố</Title>
          {header}
          <Divider />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <ReadField label="Loại sự cố">{type ? INCIDENT_TYPE_LABEL[type] : ''}</ReadField>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <ReadField label="Món đồ liên quan">{itemText ?? 'Cả đơn'}</ReadField>
            </Grid.Col>
          </Grid>
          <ReadField label="Mô tả">{description}</ReadField>
        </Stack>
      </Card>
    )
  }

  return (
    <Card>
      <Stack gap="md">
        <Title order={5}>Thông tin sự cố</Title>
        {header}
        <Divider />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Loại sự cố"
              placeholder="Chọn loại"
              data={TYPE_OPTIONS}
              required
              {...form.getInputProps('type')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Món đồ liên quan"
              placeholder={view ? 'Cả đơn' : 'Nhập mã đơn trước'}
              data={itemOptions}
              clearable
              disabled={!view}
              {...form.getInputProps('orderItemId')}
            />
          </Grid.Col>
          {selected && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Số món bị sự cố"
                min={1}
                allowDecimal={false}
                rightSection={countSuffix}
                rightSectionWidth={countSuffix ? 80 : undefined}
                {...form.getInputProps('affectedCount')}
              />
            </Grid.Col>
          )}
        </Grid>
        <Textarea
          label="Mô tả"
          autosize
          minRows={3}
          maxLength={1000}
          required
          {...form.getInputProps('description')}
        />
      </Stack>
    </Card>
  )
}
