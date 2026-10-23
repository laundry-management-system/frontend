import {
  Button,
  Checkbox,
  Divider,
  Group,
  Input,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/ui'
import { serviceFormSchema } from '../application/schemas'
import { useCreateService } from '../application/useCreateService'
import { useUpdateService } from '../application/useUpdateService'
import { isPriceChanged, SERVICE_NAME_MAX, toFormValues, toServicePayload } from '../domain/rules'
import {
  SERVICE_STATUS_LABEL,
  type Service,
  type ServiceFormValues,
  type ServiceStatus,
  type ServiceUnit,
  UNIT_LABEL,
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

const UNIT_OPTIONS = (Object.keys(UNIT_LABEL) as ServiceUnit[]).map((u) => ({
  value: u,
  label: UNIT_LABEL[u],
}))

export function ServiceFormModal(props: ServiceFormModalProps) {
  const { opened, onClose, mode, initial } = props
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
      {opened && <ServiceForm {...props} />}
    </Modal>
  )
}

function ServiceForm({ onClose, mode, initial }: ServiceFormModalProps) {
  const create = useCreateService()
  const update = useUpdateService()
  const pending = create.isPending || update.isPending
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [pricePending, setPricePending] = useState<ServiceFormValues | null>(null)

  const form = useForm<ServiceFormValues>({
    initialValues: toFormValues(initial),
    validate: schemaResolver(serviceFormSchema, { sync: true }),
  })
  const v = form.values
  const unitLabel = v.unit ? UNIT_LABEL[v.unit] : 'đơn vị'

  const handleError = (err: unknown) => {
    const error = toApiError(err)
    // BE đặt tên field đơn giá là `currentPrice`, form là `price`
    const { currentPrice, ...rest } = error.fieldErrors
    const errors = currentPrice ? { price: currentPrice, ...rest } : rest
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
    isPriceChanged(initial, values) ? setPricePending(values) : save(values),
  )

  const close = () => (form.isDirty() ? setConfirmDiscard(true) : onClose())
  const toggleExpress = () => form.setFieldValue('expressSupported', !v.expressSupported)
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
        <MoneyInput
          label={
            <InfoLabel
              info={
                mode === 'edit' &&
                // Không hứa ghi nhật ký: BE chưa lưu lịch sử giá (BE-S1)
                'Đổi giá phải nhập lý do.'
              }
            >
              {`Đơn giá (mỗi ${unitLabel})`}
            </InfoLabel>
          }
          required
          {...form.getInputProps('price')}
        />
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
        <NumberInput
          label="Thời gian xử lý chuẩn"
          required
          min={1}
          allowDecimal={false}
          allowNegative={false}
          rightSection="giờ"
          rightSectionWidth={44}
          {...form.getInputProps('standardHours')}
        />
        {mode === 'edit' && (
          <Input.Wrapper
            label={
              <InfoLabel info="Dịch vụ ngừng hoạt động không còn trong lựa chọn khi phân loại đơn mới; đơn cũ giữ nguyên.">
                Trạng thái
              </InfoLabel>
            }
          >
            <SegmentedControl
              fullWidth
              value={v.status}
              onChange={(s) => form.setFieldValue('status', s as ServiceStatus)}
              data={(['ACTIVE', 'INACTIVE'] as ServiceStatus[]).map((s) => ({
                value: s,
                label: SERVICE_STATUS_LABEL[s],
              }))}
            />
          </Input.Wrapper>
        )}
      </SimpleGrid>
    </>
  )

  const optionList = (
    <Stack gap={0} style={OPTION_BOX}>
      <Checkbox.Card
        checked={v.expressSupported}
        onClick={toggleExpress}
        withBorder={false}
        radius={0}
        p="md"
      >
        <Group gap="sm" wrap="nowrap">
          <Checkbox.Indicator />
          <Text fw={500}>Hỗ trợ giặt nhanh</Text>
        </Group>
      </Checkbox.Card>
      {v.expressSupported && (
        <SimpleGrid cols={2} px="md" pb="md">
          <MoneyInput
            label={`Phụ phí giặt nhanh (mỗi ${unitLabel})`}
            required
            {...form.getInputProps('expressSurcharge')}
          />
          <NumberInput
            label="Thời gian giặt nhanh"
            required
            min={1}
            allowDecimal={false}
            allowNegative={false}
            rightSection="giờ"
            rightSectionWidth={44}
            {...form.getInputProps('expressHours')}
          />
        </SimpleGrid>
      )}
      <Divider />
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
        onClose={() => setConfirmDiscard(false)}
        onConfirm={onClose}
        kind="confirm"
        title="Bỏ thay đổi?"
        confirmLabel="Bỏ thay đổi"
      >
        Các thông tin vừa nhập sẽ không được lưu.
      </ConfirmModal>
      <ConfirmModal
        opened={!!pricePending}
        onClose={() => setPricePending(null)}
        onConfirm={(reason) => {
          save(pricePending!, reason)
          setPricePending(null)
        }}
        kind="reason"
        title={`Đổi giá ${initial?.name ?? ''}`}
        confirmLabel="Lưu giá mới"
      >
        {pricePending && initial && (
          <PriceChange oldPrice={initial.price} newPrice={Number(pricePending.price)} />
        )}
      </ConfirmModal>
    </>
  )

  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        {basicFields}

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
