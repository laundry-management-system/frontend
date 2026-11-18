import {
  Autocomplete,
  Button,
  Input,
  Modal,
  NumberInput,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Textarea,
  Text,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { schemaResolver, useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { type ChangeEvent, useState } from 'react'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter } from '@/shared/admin/ui'
import { machineFormSchema } from '../application/schemas'
import { useCreateMachine } from '../application/useCreateMachine'
import { useUpdateMachine } from '../application/useUpdateMachine'
import {
  codePrefix,
  createdCodesLabel,
  MACHINE_LIMITS,
  MAX_BATCH_QUANTITY,
  machineErrorMessage,
  stripBatchPrefix,
  resizeSerials,
  toCreateRequest,
  toFormValues,
  toUpdatePayload,
} from '../domain/rules'
import {
  type Machine,
  type MachineFormValues,
  MACHINE_TYPE_LABEL,
  type MachineImage,
  type MachineType,
} from '../domain/types'
import { MachineImageField } from './MachineImageField'

interface MachineFormModalProps {
  opened: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  /** Bắt buộc khi mode = edit */
  initial?: Machine
  brandOptions: string[]
}

const TYPE_OPTIONS = (Object.keys(MACHINE_TYPE_LABEL) as MachineType[]).map((t) => ({
  value: t,
  label: MACHINE_TYPE_LABEL[t],
}))

export function MachineFormModal(props: MachineFormModalProps) {
  const { opened, onClose, mode, initial } = props
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={640}
      title={
        mode === 'create' ? (
          'Thêm máy'
        ) : (
          <>
            Sửa máy <EntityCode code={initial!.code} /> – {initial!.name}
          </>
        )
      }
      // Form tự hỏi "Bỏ thay đổi?", không đóng khi bấm ra ngoài/Esc
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {opened && <MachineForm {...props} />}
    </Modal>
  )
}

function MachineForm({ onClose, mode, initial, brandOptions }: MachineFormModalProps) {
  const create = useCreateMachine()
  const update = useUpdateMachine()
  const pending = create.isPending || update.isPending
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [uploading, setUploading] = useState(false)

  const form = useForm<MachineFormValues>({
    initialValues: toFormValues(initial),
    validate: schemaResolver(machineFormSchema, { sync: true }),
  })

  const handleError = (err: unknown) => {
    const error = toApiError(err)
    // `documentId` là field lỗi của requireImage ở BE, form gọi là `image`
    const { documentId, ...rest } = stripBatchPrefix(error.fieldErrors)
    const errors = { ...rest, ...(documentId && { image: documentId }) }
    if (Object.keys(errors).some((key) => key.split('.')[0] in form.values)) form.setErrors(errors)
    else if (error.status !== 403) notify.error(machineErrorMessage(error))
  }

  const submit = form.onSubmit((values) => {
    const created = (machines: Machine[]) => {
      const codes = createdCodesLabel(machines)
      notify.success(
        machines.length > 1 ? `Đã thêm ${machines.length} máy ${codes}` : `Đã thêm máy ${codes}`,
      )
      onClose()
    }
    const saved = (m: Machine) => {
      notify.success(`Đã lưu máy ${m.code}`)
      onClose()
    }
    if (mode === 'create')
      create.mutate(toCreateRequest(values), { onSuccess: created, onError: handleError })
    else
      update.mutate(
        { id: initial!.id, dto: toUpdatePayload(values) },
        { onSuccess: saved, onError: handleError },
      )
  })

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())
  const closeDiscard = () => setConfirmDiscard(false)
  const handleTypeChange = (t: string) => form.setFieldValue('type', t as MachineType)
  const handleSerialChange = (e: ChangeEvent<HTMLInputElement>) =>
    form.setFieldValue('serialNumber', e.currentTarget.value.toUpperCase())
  const handleImageChange = (image: MachineImage | null) => form.setFieldValue('image', image)
  const isCreate = mode === 'create'
  const quantity = Number(form.values.quantity) || 1
  const batch = isCreate && quantity > 1
  const handleQuantityChange = (q: number | string) => {
    form.setFieldValue('quantity', q === '' ? '' : Number(q))
    form.setFieldValue('serialNumbers', resizeSerials(form.values.serialNumbers, Number(q) || 0))
  }
  const handleBatchSerialChange = (i: number, e: ChangeEvent<HTMLInputElement>) =>
    form.setFieldValue(`serialNumbers.${i}`, e.currentTarget.value.toUpperCase())
  const prefix = codePrefix(form.values.type, form.values.brand)
  const codePreview = prefix ? `${prefix}…` : ''
  const today = dayjs().format('YYYY-MM-DD')

  const basicFields = (
    <>
      <Input.Wrapper label="Loại máy" required>
        <SegmentedControl
          fullWidth
          data={TYPE_OPTIONS}
          value={form.values.type}
          onChange={handleTypeChange}
        />
      </Input.Wrapper>
      <TextInput
        label="Tên máy"
        required
        data-autofocus
        maxLength={MACHINE_LIMITS.name}
        {...form.getInputProps('name')}
      />
      <SimpleGrid cols={2}>
        <Autocomplete
          label="Hãng máy"
          required
          placeholder="VD: LG, Electrolux"
          data={brandOptions}
          maxLength={MACHINE_LIMITS.brand}
          {...form.getInputProps('brand')}
        />
        <NumberInput
          label="Công suất"
          required
          min={0.1}
          max={MACHINE_LIMITS.capacityMax}
          decimalScale={1}
          decimalSeparator=","
          allowNegative={false}
          rightSection="kg"
          rightSectionWidth={40}
          {...form.getInputProps('capacityKg')}
        />
      </SimpleGrid>
    </>
  )

  const createFields = isCreate && (
    <SimpleGrid cols={2}>
      <TextInput
        label={
          <InfoLabel info="Hệ thống tự cấp theo mẫu W/D-<3 ký tự đầu của hãng>-001, đánh số riêng theo loại máy và hãng. Mã không đổi khi sửa máy.">
            Mã máy
          </InfoLabel>
        }
        value={codePreview}
        placeholder="Tự cấp sau khi nhập hãng"
        readOnly
        variant="filled"
      />
      <NumberInput
        label={
          <InfoLabel info="Tạo nhiều máy cùng thông tin. Mỗi máy có mã riêng, tên thêm số thứ tự (VD: Máy giặt LG 3) và số serial riêng.">
            Số lượng
          </InfoLabel>
        }
        required
        min={1}
        max={MAX_BATCH_QUANTITY}
        allowDecimal={false}
        allowNegative={false}
        {...form.getInputProps('quantity')}
        onChange={handleQuantityChange}
      />
    </SimpleGrid>
  )

  const serialFields = batch ? (
    <Input.Wrapper label={`Số serial từng máy (${quantity} máy)`}>
      <SimpleGrid cols={{ base: 2, sm: 3 }} mt={4}>
        {form.values.serialNumbers.map((_, i) => (
          <TextInput
            key={i}
            aria-label={`Số serial máy ${i + 1}`}
            leftSection={
              <Text size="xs" c="dimmed">
                {i + 1}
              </Text>
            }
            maxLength={MACHINE_LIMITS.serial}
            {...form.getInputProps(`serialNumbers.${i}`)}
            onChange={(e) => handleBatchSerialChange(i, e)}
          />
        ))}
      </SimpleGrid>
    </Input.Wrapper>
  ) : (
    <TextInput
      label="Số serial"
      maxLength={MACHINE_LIMITS.serial}
      {...form.getInputProps('serialNumber')}
      onChange={handleSerialChange}
    />
  )

  const assetFields = (
    <>
      {createFields}
      <SimpleGrid cols={2}>
        <TextInput
          label="Model"
          maxLength={MACHINE_LIMITS.model}
          {...form.getInputProps('model')}
        />
        <TextInput
          label="Vị trí đặt máy"
          placeholder="VD: Khu giặt, dãy trái"
          maxLength={MACHINE_LIMITS.location}
          {...form.getInputProps('location')}
        />
        <DatePickerInput
          label="Ngày mua"
          valueFormat="DD/MM/YYYY"
          clearable
          maxDate={today}
          {...form.getInputProps('purchaseDate')}
        />
        <DatePickerInput
          label="Hết hạn bảo hành"
          valueFormat="DD/MM/YYYY"
          clearable
          minDate={form.values.purchaseDate ?? undefined}
          {...form.getInputProps('warrantyUntil')}
        />
      </SimpleGrid>
      {serialFields}
      <Textarea
        label="Ghi chú"
        autosize
        minRows={2}
        maxLength={MACHINE_LIMITS.note}
        description={`Còn ${MACHINE_LIMITS.note - form.values.note.length} ký tự`}
        {...form.getInputProps('note')}
      />
    </>
  )

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <MachineImageField
            value={form.values.image}
            onChange={handleImageChange}
            onUploadingChange={setUploading}
            type={form.values.type}
            error={form.errors.image}
          />
          <Stack>{basicFields}</Stack>
        </SimpleGrid>
        {assetFields}
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Hủy
          </Button>
          <Button type="submit" loading={pending || uploading}>
            {mode === 'edit' ? 'Lưu' : batch ? `Thêm ${form.values.quantity} máy` : 'Thêm máy'}
          </Button>
        </ModalFooter>
      </Stack>

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
    </form>
  )
}
