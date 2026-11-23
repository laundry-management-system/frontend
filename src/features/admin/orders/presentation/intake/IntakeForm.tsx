import {
  Alert,
  Box,
  Badge,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import dayjs from 'dayjs'
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { LuCircleCheck, LuPrinter, LuTags, LuUserCheck } from 'react-icons/lu'
import { useCustomerByPhone, useCustomerStats } from '@/features/admin/customers'
import { priceFor, useActiveServices, useWashModes } from '@/features/admin/services'
import { useShopSettings } from '@/features/admin/settings'
import { toApiError } from '@/shared/common/api/apiError'
import { OPENING_HOURS } from '@/shared/admin/config/constants'
import { useDebounce } from '@/shared/admin/hooks/useDebounce'
import { formatPersonName, stripDigits, formatPhone } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { EmptyState, InfoLabel } from '@/shared/admin/ui'
import { intakeFormSchema, stripPhone, type IntakeFormValues } from '../../application/schemas'
import { useCreateIntake } from '../../application/mutations/useCreateIntake'
import {
  clampToOpeningHours,
  type QuickDueOption,
  suggestDueAtForHours,
  validateDueAt,
} from '../../domain/dueDate'
import {
  type DueKey,
  intakeBlockReason,
  servicesNotApplicable,
  toIntakeRequest,
} from '../../domain/intake'
import { formatPhoneTyping } from '../../domain/rules'
import type { OrderDetail, ReceiptData } from '../../domain/types'
import { PlannedOrderCard } from './PlannedOrderCard'
import { ReceiptSheet } from './ReceiptSheet'
import { ServicePicker } from './ServicePicker'
import { WashModePicker } from './WashModePicker'
import { FIT_VIEWPORT, STICKY_ASIDE, TWO_COLUMNS_QUERY } from '../stickyAside'

const isValidPhone = (phone: string) => /^0\d{9}$/.test(phone)

// BE đặt tên field khác form
const FIELD_OF: Record<string, keyof IntakeFormValues> = {
  customerPhone: 'phone',
  customerName: 'customerName',
}

export interface IntakeResult {
  intakeCode: string
  orders: OrderDetail[]
}

interface IntakeFormProps {
  initialPhone?: string
  onCreated: (result: IntakeResult) => void
}

function Step({
  n,
  title,
  aside,
  children,
}: {
  n: number
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <Card px="xl" py="lg">
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon size={26} radius="xl" variant="light" color="teal">
            <Text size="sm" fw={700}>
              {n}
            </Text>
          </ThemeIcon>
          <Title order={5}>{title}</Title>
          {aside && (
            <Text size="sm" c="dimmed" ml="auto">
              {aside}
            </Text>
          )}
        </Group>
        {children}
      </Stack>
    </Card>
  )
}

/**
 * Tiếp nhận đồ (WF-C01): khách → hình thức giặt → dịch vụ → đơn sẽ tạo → tạo & in.
 * Một lượt = một đơn; chọn hình thức trước như đặt online, giá chốt lúc phân loại.
 */
export function IntakeForm({ initialPhone = '', onCreated }: IntakeFormProps) {
  const now = useMemo(() => new Date(), [])
  const twoColumns = useMediaQuery(TWO_COLUMNS_QUERY)
  const nameRef = useRef<HTMLInputElement>(null)
  const createIntake = useCreateIntake()
  const { data: services = [], isLoading: servicesLoading } = useActiveServices()
  const shopSettings = useShopSettings().data
  const whitesFee = shopSettings?.whitesFee
  const { data: allModes, isLoading: modesLoading } = useWashModes()
  const modes = useMemo(() => (allModes ?? []).filter((m) => m.active), [allModes])
  const defaultMode = modes.find((m) => m.isDefault)
  const [pickedModeId, setPickedModeId] = useState<number | null>(null)
  const mode = modes.find((m) => m.id === pickedModeId) ?? defaultMode
  const [serviceIds, setServiceIds] = useState<number[]>([])
  const [whitesChecked, setWhitesChecked] = useState(false)
  const [due, setDueValue] = useState<Date | null>(null)
  const [dueKey, setDueKey] = useState<DueKey>('suggest')
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const [errors, setErrors] = useState<{ washModeId?: string; items?: string; dueAt?: string }>({})

  const form = useForm<IntakeFormValues>({
    initialValues: { phone: formatPhoneTyping(initialPhone), customerName: '' },
    validate: schemaResolver(intakeFormSchema, { sync: true }),
  })

  const phone = stripPhone(form.values.phone)
  const debouncedPhone = useDebounce(phone, 300)
  const lookupPhone = isValidPhone(debouncedPhone) ? debouncedPhone : null
  const lookup = useCustomerByPhone(lookupPhone)
  const customer = lookupPhone ? lookup.data : undefined
  const { stats } = useCustomerStats(customer?.phone)
  // Chưa biết khách cũ/mới thì chưa cho tạo, tránh tạo trùng hồ sơ
  const lookupPending = isValidPhone(phone) && (debouncedPhone !== phone || lookup.isFetching)
  const inactive = customer?.status === 'INACTIVE'
  const isNewCustomer = customer === null
  // Ô tên chỉ mở cho khách mới, sau khi đã tra xong SĐT
  const nameLocked = !isValidPhone(phone) || lookupPending || !!customer

  const { setFieldValue } = form
  const autofilled = useRef(false)
  const lookupKey = customer ? `customer:${customer.id}` : isNewCustomer ? 'new' : 'none'
  useEffect(() => {
    if (customer) {
      setFieldValue('customerName', customer.fullName)
      autofilled.current = true
      return
    }
    // Đổi sang SĐT khác: bỏ tên khách cũ vừa tự điền
    if (autofilled.current) {
      setFieldValue('customerName', '')
      autofilled.current = false
    }
    if (isNewCustomer) nameRef.current?.focus()
    // Chỉ chạy khi kết quả tra khách đổi: `setFieldValue` của Mantine đổi identity mỗi render,
    // để nó trong deps sẽ lặp vô hạn (Maximum update depth) và chặn cả navigate sau khi tạo đơn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupKey])

  const minDue = mode && suggestDueAtForHours(now, mode.completionHours, OPENING_HOURS)
  const dueAt = dueKey === 'suggest' ? (minDue ?? null) : due
  const selectedServices = services.filter((s) => serviceIds.includes(s.id))
  const notApplicable = mode ? servicesNotApplicable(services, serviceIds, mode.id) : []
  const applicable = selectedServices.filter((s) => !notApplicable.includes(s))
  const whitesAvailable = applicable.some((s) => s.whitesApplicable)
  const whites = whitesAvailable && whitesChecked
  const blockReason =
    (inactive && 'Hồ sơ khách đang ngừng hoạt động.') ||
    intakeBlockReason({
      phoneValid: isValidPhone(phone),
      customerName: form.values.customerName,
      serviceIds,
      hasMode: !!mode,
      notApplicable: notApplicable.map((s) => s.name),
      dueError: validateDueAt(dueAt, now, minDue),
    })

  const pickMode = (id: number) => {
    setPickedModeId(id)
    setDueKey('suggest')
    setErrors({})
  }
  const toggleService = (id: number) =>
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const setDue = (value: Date | null) => {
    const clamped = value && clampToOpeningHours(value, OPENING_HOURS)
    if (value && clamped && clamped.getTime() !== value.getTime())
      notify.info(`Ngoài giờ mở cửa, đã chuyển sang ${dayjs(clamped).format('DD/MM HH:mm')}`)
    setDueValue(clamped)
    setDueKey('custom')
  }
  const pickQuickDue = (o: QuickDueOption) => {
    setDueValue(o.date)
    setDueKey(o.key)
  }

  const handleSubmit = form.onSubmit((values) => {
    if (blockReason || !mode || lookupPending || createIntake.isPending) return
    setErrors({})
    createIntake.mutate(
      toIntakeRequest({
        requestId,
        customerPhone: phone,
        customerName: formatPersonName(values.customerName),
        washModeId: mode.id,
        serviceIds,
        washWhitesSeparately: whites,
        // "Gợi ý": để server tự đặt minDue theo giờ mở cửa thật và thời điểm tạo
        dueAt: dueKey === 'suggest' ? null : dueAt,
      }),
      {
        onSuccess: (result) => {
          setRequestId(crypto.randomUUID())
          onCreated(result)
        },
        onError: (e) => {
          const err = toApiError(e)
          const fieldErrors: Record<string, string> = {}
          const next: typeof errors = {}
          for (const [k, v] of Object.entries(err.fieldErrors)) {
            if (k === 'washModeId') next.washModeId = v
            else if (k === 'dueAt') next.dueAt = v
            else if (k.startsWith('items')) next.items = next.items ? `${next.items}; ${v}` : v
            else if (FIELD_OF[k]) fieldErrors[FIELD_OF[k]] = v
          }
          form.setErrors(fieldErrors)
          setErrors(next)
          notify.error(err.message)
        },
      },
    )
  })

  const previewData: ReceiptData = {
    orderCode: `LD-${dayjs(now).format('YYYYMMDD')}-…`,
    receivedAt: now.toISOString(),
    customerName: form.values.customerName.trim(),
    customerPhone: isValidPhone(phone) ? formatPhone(phone) : form.values.phone,
    dueAt: dueAt ? dueAt.toISOString() : '',
    shopName: 'Tiệm Giặt Ủi',
    hotline: '',
    washModeName: mode?.name,
    washWhitesSeparately: whites,
    whitesFee: whitesFee ?? 0,
    compensationMultiplier: shopSettings?.compensationMultiplier ?? 10,
    compensationCap: shopSettings?.compensationCap ?? 500000,
    services: mode
      ? applicable.map((s) => ({
          name: s.name,
          unit: s.unit ?? 'PIECE',
          unitPrice: priceFor(s, mode.id) ?? 0,
          expressSurcharge: null,
          minQuantity: s.minQuantity,
        }))
      : [],
  }

  const customerCard = customer && (
    <Group
      gap="sm"
      wrap="nowrap"
      px="md"
      py="sm"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: `var(--tone-${inactive ? 'warning' : 'success'}-bg)`,
        border: `1px solid var(--tone-${inactive ? 'warning' : 'success'}-border)`,
      }}
    >
      <ThemeIcon
        size={40}
        radius="xl"
        variant="light"
        color={inactive ? 'warning' : 'success'}
        aria-hidden
      >
        <LuUserCheck size={20} />
      </ThemeIcon>
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text fw={600} truncate>
          {customer.fullName}
        </Text>
        <Text size="sm" c="dimmed">
          {formatPhone(customer.phone)}
          {stats && ` · ${stats.orderCount} đơn trước`}
        </Text>
      </Stack>
      <Badge
        color={inactive ? 'warning' : 'success'}
        variant="light"
        leftSection={<LuCircleCheck size={12} />}
      >
        Tìm được hồ sơ
      </Badge>
    </Group>
  )

  const modeBody = modesLoading ? (
    <Center py="md">
      <Loader size="sm" />
    </Center>
  ) : mode ? (
    <WashModePicker modes={modes} value={mode.id} error={errors.washModeId} onChange={pickMode} />
  ) : (
    <EmptyState
      icon={<LuTags size={32} />}
      title="Chưa có hình thức giặt đang hoạt động"
      description="Admin cần thêm hoặc kích hoạt hình thức ở trang Bảng giá dịch vụ."
    />
  )

  const servicesBody = servicesLoading ? (
    <Center py="md">
      <Loader size="sm" />
    </Center>
  ) : services.length && mode ? (
    <>
      <ServicePicker
        services={services}
        selectedIds={serviceIds}
        washModeId={mode.id}
        defaultModeId={defaultMode?.id ?? null}
        completionHours={mode.completionHours}
        onToggle={toggleService}
      />
      {errors.items && (
        <Text size="sm" c="red">
          {errors.items}
        </Text>
      )}
    </>
  ) : (
    <EmptyState
      icon={<LuTags size={32} />}
      title="Chưa có dịch vụ đang hoạt động"
      description="Admin cần thêm hoặc kích hoạt dịch vụ ở trang Bảng giá dịch vụ."
    />
  )

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFieldValue('phone', formatPhoneTyping(e.currentTarget.value))
  const handlePhoneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || customer) return
    e.preventDefault()
    if (!nameLocked) nameRef.current?.focus()
  }
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFieldValue('customerName', stripDigits(e.currentTarget.value))
  const handleNameBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFieldValue('customerName', formatPersonName(e.currentTarget.value))
    form.getInputProps('customerName').onBlur?.()
  }
  const dropNotApplicable = () =>
    setServiceIds((prev) => prev.filter((id) => !notApplicable.some((s) => s.id === id)))

  const customerFields = (
    <>
      <TextInput
        label={
          <InfoLabel info="Nhập trước để tìm khách cũ; khách mới sẽ được tạo hồ sơ cùng đơn">
            Số điện thoại
          </InfoLabel>
        }
        required
        autoFocus
        inputMode="tel"
        placeholder="0938 111 222"
        {...form.getInputProps('phone')}
        onChange={handlePhoneChange}
        rightSection={lookupPending ? <Loader size="xs" /> : undefined}
        onKeyDown={handlePhoneKeyDown}
      />
      {customerCard}
      {inactive && (
        <Alert color="warning" title="Hồ sơ khách đang ngừng hoạt động">
          Kích hoạt lại hồ sơ ở màn Khách hàng trước khi tạo đơn.
        </Alert>
      )}
      <TextInput
        ref={nameRef}
        label="Họ và tên"
        required
        disabled={nameLocked}
        placeholder={isValidPhone(phone) ? 'Nguyễn Văn A' : 'Nhập số điện thoại trước'}
        {...form.getInputProps('customerName')}
        onChange={handleNameChange}
        onBlur={handleNameBlur}
      />
    </>
  )

  const orderPlan = mode && serviceIds.length > 0 && (
    <PlannedOrderCard
      mode={mode}
      services={applicable}
      dueAt={dueAt}
      dueKey={dueKey}
      now={now}
      whitesFee={whitesFee}
      whitesAvailable={whitesAvailable}
      whites={whites}
      error={errors.dueAt}
      onDueChange={setDue}
      onQuickDue={pickQuickDue}
      onWhitesChange={setWhitesChecked}
    />
  )

  const submitBar = (
    <Stack gap={6}>
      <Button
        type="submit"
        size="lg"
        fullWidth
        leftSection={<LuPrinter size={18} />}
        loading={createIntake.isPending}
        disabled={!!blockReason || lookupPending}
      >
        Tạo đơn & in phiếu (2 liên)
      </Button>
      <Text size="sm" c="dimmed" ta="center" aria-live="polite" mih={20}>
        {blockReason}
      </Text>
      {notApplicable.length > 0 && (
        <Button variant="secondary" onClick={dropNotApplicable}>
          Bỏ các dịch vụ này
        </Button>
      )}
    </Stack>
  )

  const receiptPreview = (
    <Card
      px="xl"
      py="lg"
      bg="var(--ds-muted)"
      style={twoColumns ? { ...FIT_VIEWPORT, display: 'flex', flexDirection: 'column' } : undefined}
    >
      <Stack gap="md" mih={0} style={{ flex: 1 }}>
        <Title order={5}>
          <InfoLabel info="Khối lượng, tổng tiền và giá chốt được cập nhật ở màn Phân loại đồ">
            Xem trước phiếu (liên khách giữ)
          </InfoLabel>
        </Title>
        {/* Phiếu dài hơn màn hình thì cuộn bên trong, khung xem trước vẫn đứng yên */}
        <Box mih={0} style={{ flex: 1, overflowY: twoColumns ? 'auto' : undefined }}>
          <ReceiptSheet data={previewData} copies={1} />
        </Box>
      </Stack>
    </Card>
  )

  return (
    <Grid gap="xl" align="flex-start">
      <Grid.Col span={{ base: 12, lg: 7 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            <Step n={1} title="Khách hàng">
              {customerFields}
            </Step>

            <Step n={2} title="Hình thức giặt">
              {modeBody}
            </Step>

            <Step
              n={3}
              title="Dịch vụ khách mang đến"
              aside={serviceIds.length ? `Đã chọn ${serviceIds.length}` : 'Chưa chọn'}
            >
              {servicesBody}
            </Step>

            <Step n={4} title="Đơn sẽ tạo">
              {orderPlan || (
                <Text size="sm" c="dimmed">
                  Chọn dịch vụ ở bước 3 để xem đơn.
                </Text>
              )}
            </Step>

            {submitBar}
          </Stack>
        </form>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 5 }} style={twoColumns ? STICKY_ASIDE : undefined}>
        {receiptPreview}
      </Grid.Col>
    </Grid>
  )
}
