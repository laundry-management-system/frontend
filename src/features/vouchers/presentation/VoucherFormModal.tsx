import {
  Button,
  Group,
  Input,
  Modal,
  NumberInput,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { schemaResolver, useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { type ChangeEvent, useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/ui'
import {
  toVoucherFormValues,
  toVoucherRequest,
  voucherFormSchema,
  type VoucherFormValues,
} from '../application/schemas'
import { useSaveVoucher } from '../application/useSaveVoucher'
import { VOUCHER_CODE_MAX, voucherErrorMessage } from '../domain/rules'
import type { DiscountType, Voucher } from '../domain/types'

interface VoucherFormModalProps {
  opened: boolean
  onClose: () => void
  /** null: tạo mới */
  voucher: Voucher | null
}

const TYPE_OPTIONS = [
  { value: 'PERCENT', label: '%' },
  { value: 'AMOUNT', label: 'Số tiền' },
]

export function VoucherFormModal(props: VoucherFormModalProps) {
  const { opened, onClose, voucher } = props
  const title = voucher ? (
    <>
      Sửa voucher <EntityCode code={voucher.code} />
    </>
  ) : (
    'Tạo voucher'
  )
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={560}
      title={title}
      // Form tự hỏi "Bỏ thay đổi?", không đóng khi bấm ra ngoài/Esc
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {opened && <VoucherForm {...props} />}
    </Modal>
  )
}

function VoucherForm({ onClose, voucher }: VoucherFormModalProps) {
  const save = useSaveVoucher()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const isCreate = !voucher

  const form = useForm<VoucherFormValues>({
    initialValues: toVoucherFormValues(voucher, dayjs().format('YYYY-MM-DD')),
    validate: schemaResolver(
      voucherFormSchema(isCreate ? 'create' : 'edit', voucher?.usedCount ?? 0),
      { sync: true },
    ),
  })

  const handleError = (err: unknown) => {
    const error = toApiError(err)
    if (error.status === 403) return
    const { field, message } = voucherErrorMessage(error)
    if (field) form.setFieldError(field, message)
    else notify.error(message)
  }

  const submit = form.onSubmit((values) =>
    save.mutate(
      { id: voucher?.id, dto: toVoucherRequest(values) },
      {
        onSuccess: (v) => {
          notify.success(isCreate ? `Đã tạo voucher ${v.code}` : `Đã lưu voucher ${v.code}`)
          onClose()
        },
        onError: handleError,
      },
    ),
  )

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())
  const closeDiscard = () => setConfirmDiscard(false)
  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) =>
    form.setFieldValue('code', e.currentTarget.value.toUpperCase())
  const handleTypeChange = (t: string) => form.setFieldValue('discountType', t as DiscountType)
  const isPercent = form.values.discountType === 'PERCENT'

  const valueInput = isPercent ? (
    <NumberInput
      label="Giá trị"
      required
      min={0}
      max={100}
      decimalScale={2}
      decimalSeparator=","
      allowNegative={false}
      rightSection="%"
      {...form.getInputProps('discountValue')}
    />
  ) : (
    <MoneyInput label="Giá trị" required {...form.getInputProps('discountValue')} />
  )

  const usedInfo = voucher && (
    <Group gap={6}>
      <InfoLabel info="Đơn hủy sẽ được trả lượt khi hệ thống hỗ trợ.">Đã sử dụng:</InfoLabel>
      <Text fw={600}>{voucher.usedCount} lần</Text>
    </Group>
  )

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        {isCreate && (
          <TextInput
            label="Mã voucher"
            required
            data-autofocus
            placeholder="GIAT10"
            maxLength={VOUCHER_CODE_MAX}
            {...form.getInputProps('code')}
            onChange={handleCodeChange}
          />
        )}
        <SimpleGrid cols={2}>
          <Input.Wrapper label="Loại giảm" required>
            <SegmentedControl
              fullWidth
              data={TYPE_OPTIONS}
              value={form.values.discountType}
              onChange={handleTypeChange}
            />
          </Input.Wrapper>
          {valueInput}
          <DatePickerInput
            label="Ngày bắt đầu"
            required
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps('startDate')}
          />
          <DatePickerInput
            label="Ngày kết thúc"
            required
            valueFormat="DD/MM/YYYY"
            minDate={form.values.startDate ?? undefined}
            {...form.getInputProps('endDate')}
          />
          <MoneyInput label="Đơn tối thiểu" {...form.getInputProps('minOrderValue')} />
          <NumberInput
            label="Số lần dùng tối đa"
            required
            min={1}
            allowDecimal={false}
            allowNegative={false}
            {...form.getInputProps('maxUses')}
          />
        </SimpleGrid>
        {usedInfo}
        <ModalFooter>
          <Button variant="secondary" onClick={close} disabled={save.isPending}>
            Hủy
          </Button>
          <Button type="submit" loading={save.isPending}>
            Lưu voucher
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
