import {
  Button,
  Checkbox,
  Divider,
  Badge,
  Group,
  Input,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/common/api/apiError'
import { formatMoney } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/admin/ui'
import { serviceFormSchema } from '../application/schemas'
import { useWashModes } from '../application/queries/useWashModes'
import { useCreateService } from '../application/mutations/useCreateService'
import { useUpdateService } from '../application/mutations/useUpdateService'
import { formatPriceValue, priceFieldLabel } from '../domain/priceHistory'
import {
  priceFor,
  SERVICE_NAME_MAX,
  toFormValues,
  toServicePayload,
  trackedChanges,
  type TrackedChange,
} from '../domain/rules'
import {
  type Service,
  type ServiceFormValues,
  type ServiceUnit,
  UNIT_LABEL,
  type WashMode,
} from '../domain/types'
import { PriceChange } from './PriceChange'

const OPTION_BOX = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--radius-control)',
  overflow: 'hidden',
} as const

interface ServiceFormModalProps {
  opened: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  /** Bắt buộc khi mode = edit */
  initial?: Service
}

const changeLine = (c: TrackedChange) => (
  <Text key={c.field} size="sm">
    {c.modeName ? `Giá ${c.modeName}` : priceFieldLabel(c.field)}:{' '}
    {formatPriceValue(c.field, c.oldValue)} →{' '}
    <Text span fw={500}>
      {formatPriceValue(c.field, c.newValue)}
    </Text>
  </Text>
)

const UNIT_OPTIONS = (Object.keys(UNIT_LABEL) as ServiceUnit[]).map((u) => ({
  value: u,
  label: UNIT_LABEL[u],
}))

export function ServiceFormModal(props: ServiceFormModalProps) {
  const { opened, onClose, mode, initial } = props
  const { data: modes } = useWashModes()
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={560}
      title={
        mode === 'create' ? (
          'Thêm dịch vụ'
        ) : (
          <>
            Sửa dịch vụ <EntityCode code={initial!.code} /> – {initial!.name}
          </>
        )
      }
      // Form tự hỏi "Bỏ thay đổi?", không đóng khi bấm ra ngoài/Esc
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {opened && modes && <ServiceForm {...props} modes={modes} />}
    </Modal>
  )
}

function ServiceForm({
  onClose,
  mode,
  initial,
  modes,
}: ServiceFormModalProps & { modes: WashMode[] }) {
  const create = useCreateService()
  const update = useUpdateService()
  const pending = create.isPending || update.isPending
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [reasonPending, setReasonPending] = useState<ServiceFormValues | null>(null)

  const activeModes = modes.filter((m) => m.active)
  // Liên kết tới hình thức đã ngừng: chỉ đọc, BE giữ nguyên
  const stoppedLinks = modes.filter((m) => !m.active && initial && priceFor(initial, m.id) != null)

  const form = useForm<ServiceFormValues>({
    initialValues: toFormValues(initial, activeModes),
    validate: schemaResolver(serviceFormSchema, { sync: true }),
  })
  const v = form.values
  const unitLabel = v.unit ? UNIT_LABEL[v.unit] : 'đơn vị'

  const handleError = (err: unknown) => {
    const error = toApiError(err)
    const errors = error.fieldErrors
    // Lỗi không thuộc ô nào trên form thì báo toast, tránh lưu thất bại mà không có phản hồi
    if (Object.keys(errors).some((key) => key in form.values)) form.setErrors(errors)
    else notify.error(error.message)
  }

  const save = (values: ServiceFormValues, priceChangeReason?: string) => {
    const done = () => {
      notify.success(mode === 'create' ? 'Đã thêm dịch vụ' : 'Đã cập nhật dịch vụ')
      onClose()
    }
    const payload = toServicePayload(values)
    if (mode === 'create') {
      create.mutate(payload, { onSuccess: done, onError: handleError })
      return
    }
    update.mutate(
      {
        id: initial!.id,
        dto: { ...payload, status: values.status, ...(priceChangeReason && { priceChangeReason }) },
      },
      { onSuccess: done, onError: handleError },
    )
  }

  const submit = form.onSubmit((values) =>
    trackedChanges(initial, values).length > 0 ? setReasonPending(values) : save(values),
  )

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())
  const closeDiscard = () => setConfirmDiscard(false)
  const changes = reasonPending ? trackedChanges(initial, reasonPending) : []
  const isDelta = (c: TrackedChange) =>
    c.field === 'MODE_PRICE' && c.oldValue != null && c.newValue != null
  const deltaChanges = changes.filter(isDelta)
  const otherChanges = changes.filter((c) => !isDelta(c))
  const closeReason = () => setReasonPending(null)
  const confirmReason = (reason?: string) => {
    save(reasonPending!, reason)
    setReasonPending(null)
  }
  const toggleWhites = () => form.setFieldValue('whitesApplicable', !v.whitesApplicable)

  const basicFields = (
    <>
      <SimpleGrid cols={2}>
        <TextInput
          label="Tên dịch vụ"
          required
          data-autofocus
          maxLength={SERVICE_NAME_MAX}
          {...form.getInputProps('name')}
        />
        <Select
          label="Đơn vị tính"
          required
          data={UNIT_OPTIONS}
          allowDeselect={false}
          {...form.getInputProps('unit')}
        />
      </SimpleGrid>
      <SimpleGrid cols={2}>
        <NumberInput
          label={
            <InfoLabel info="Cân/đếm dưới mức này vẫn tính tiền bằng mức tối thiểu khi phân loại.">
              {`Tối thiểu (${unitLabel})`}
            </InfoLabel>
          }
          min={0}
          allowNegative={false}
          decimalSeparator=","
          {...(v.unit === 'KG' ? { decimalScale: 2 } : { allowDecimal: false })}
          {...form.getInputProps('minQuantity')}
        />
      </SimpleGrid>
    </>
  )

  const priceRows = (
    <Input.Wrapper
      label={
        <InfoLabel info="Giá theo từng hình thức giặt. Đổi giá phải nhập lý do và được ghi vào lịch sử giá.">
          {`Giá theo hình thức (mỗi ${unitLabel})`}
        </InfoLabel>
      }
      required
      error={form.errors.prices}
    >
      <Stack gap={0} style={OPTION_BOX}>
        {v.prices.map((p, i) => (
          <Group
            key={p.mode.id}
            justify="space-between"
            wrap="nowrap"
            p="md"
            style={i > 0 ? { borderTop: '1px solid var(--ds-border)' } : undefined}
          >
            <Switch
              checked={p.enabled}
              onChange={(e) => form.setFieldValue(`prices.${i}.enabled`, e.currentTarget.checked)}
              label={
                <Group gap={6}>
                  <Text fw={500}>{p.mode.name}</Text>
                  {p.mode.isDefault && <Badge variant="light">Mặc định</Badge>}
                </Group>
              }
              description={`Xong trong ${p.mode.completionHours} giờ`}
            />
            <MoneyInput
              w={160}
              aria-label={`Giá ${p.mode.name}`}
              disabled={!p.enabled}
              {...form.getInputProps(`prices.${i}.price`)}
            />
          </Group>
        ))}
        {stoppedLinks.map((m) => (
          <Group
            key={m.id}
            justify="space-between"
            p="md"
            c="dimmed"
            style={{ borderTop: '1px solid var(--ds-border)' }}
          >
            <Text>
              {m.name}{' '}
              <Badge color="neutral" variant="light">
                đã ngừng
              </Badge>
            </Text>
            <Text className="text-money">{formatMoney(priceFor(initial!, m.id)!)}</Text>
          </Group>
        ))}
      </Stack>
    </Input.Wrapper>
  )

  const optionList = (
    <Stack gap={0} style={OPTION_BOX}>
      <Checkbox.Card
        checked={v.whitesApplicable}
        onClick={toggleWhites}
        withBorder={false}
        radius={0}
        p="md"
      >
        <Group gap="sm" wrap="nowrap">
          <Checkbox.Indicator />
          <InfoLabel info="Ở quầy hiện tùy chọn giặt riêng đồ trắng (tính phụ phí theo đơn) cho đơn có dịch vụ này.">
            <Text fw={500} span>
              Áp dụng giặt riêng đồ trắng
            </Text>
          </InfoLabel>
        </Group>
      </Checkbox.Card>
    </Stack>
  )

  const dialogs = (
    <>
      <ConfirmModal
        opened={confirmDiscard}
        onClose={closeDiscard}
        onConfirm={onClose}
        kind="confirm"
        title="Bỏ thay đổi?"
        confirmLabel="Bỏ thay đổi"
      >
        Các thông tin vừa nhập sẽ không được lưu.
      </ConfirmModal>
      <ConfirmModal
        opened={!!reasonPending}
        onClose={closeReason}
        onConfirm={confirmReason}
        kind="reason"
        title={`${deltaChanges.length ? 'Đổi giá' : 'Cập nhật'} ${initial?.name ?? ''}`}
        confirmLabel={deltaChanges.length ? 'Lưu giá mới' : 'Lưu thay đổi'}
      >
        <Stack gap="sm">
          {deltaChanges.map((c) => (
            <PriceChange
              key={c.modeName}
              modeName={c.modeName}
              oldPrice={Number(c.oldValue)}
              newPrice={Number(c.newValue)}
            />
          ))}
          {otherChanges.map(changeLine)}
        </Stack>
      </ConfirmModal>
    </>
  )

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        {basicFields}
        {priceRows}

        <Divider label="Tùy chọn" labelPosition="left" />
        {optionList}
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Hủy
          </Button>
          <Button type="submit" loading={pending}>
            {mode === 'create' ? 'Thêm dịch vụ' : 'Lưu'}
          </Button>
        </ModalFooter>
      </Stack>

      {dialogs}
    </form>
  )
}
