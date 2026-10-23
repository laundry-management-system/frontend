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
  SegmentedControl,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useMediaQuery } from '@mantine/hooks'
import dayjs from 'dayjs'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { LuCircleCheck, LuPrinter, LuTags, LuUserCheck } from 'react-icons/lu'
import { formatPhone, useCustomerByPhone, useCustomerStats } from '@/features/customers'
import { type Service, useActiveServices } from '@/features/services'
import { useShopSettings } from '@/features/settings'
import { toApiError } from '@/shared/api/apiError'
import { OPENING_HOURS } from '@/shared/config/constants'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { formatPersonName, stripDigits } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { EmptyState, InfoLabel } from '@/shared/ui'
import { intakeFormSchema, stripPhone, type IntakeFormValues } from '../../application/schemas'
import { useCreateIntake } from '../../application/mutations/useCreateIntake'
import { clampToOpeningHours, type QuickDueOption } from '../../domain/dueDate'
import {
  ctaLabel,
  emptySelection,
  intakeBlockReason,
  planOrders,
  type PlannedOrder,
  toggleExpressService,
  toggleService,
} from '../../domain/intake'
import { formatPhoneTyping } from '../../domain/rules'
import type { OrderDetail, OrderType, ReceiptData } from '../../domain/types'
import { ExpressPicker } from './ExpressPicker'
import { PlannedOrderCard } from './PlannedOrderCard'
import { ReceiptSheet } from './ReceiptSheet'
import { ServicePicker } from './ServicePicker'
import { FIT_VIEWPORT, STICKY_ASIDE, TWO_COLUMNS_QUERY } from '../stickyAside'

const isValidPhone = (phone: string) => /^0\d{9}$/.test(phone)

// BE đặt tên field khác form
const FIELD_OF: Record<string, keyof IntakeFormValues> = {
  customerPhone: 'phone',
  customerName: 'customerName',
}

const TAB_LABEL: Record<OrderType, string> = { NORMAL: 'Tiêu chuẩn', EXPRESS: 'Giặt nhanh' }

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
 * Tiếp nhận đồ v3 (WF-C01): khách → dịch vụ → giặt nhanh → đơn sẽ tạo → tạo & in.
 * Dịch vụ chỉ là ghi chú tham khảo để tách đơn; giá chốt lúc phân loại.
 */
export function IntakeForm({ initialPhone = '', onCreated }: IntakeFormProps) {
  const now = useMemo(() => new Date(), [])
  const twoColumns = useMediaQuery(TWO_COLUMNS_QUERY)
  const nameRef = useRef<HTMLInputElement>(null)
  const createIntake = useCreateIntake()
  const { data: services = [], isLoading: servicesLoading } = useActiveServices()
  const whitesFee = useShopSettings().data?.whitesFee
  const [sel, setSel] = useState(emptySelection)
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const [orderErrors, setOrderErrors] = useState<Partial<Record<OrderType, string>>>({})
  const [tab, setTab] = useState<OrderType>('NORMAL')

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

  const plans = planOrders(sel, services, now, OPENING_HOURS)
  // Giặt nhanh chỉ chọn trong các dịch vụ khách đã mang đến (bước 2)
  const selectedServices = services.filter((s) => sel.serviceIds.includes(s.id))
  const blockReason =
    (inactive && 'Hồ sơ khách đang ngừng hoạt động.') ||
    intakeBlockReason({
      phoneValid: isValidPhone(phone),
      customerName: form.values.customerName,
      sel,
      plans,
      now,
    })
  const activeTab = plans.some((p) => p.orderType === tab) ? tab : (plans[0]?.orderType ?? 'NORMAL')

  const update = (next: Partial<typeof sel>) => setSel((prev) => ({ ...prev, ...next }))
  const handleToggleService = (id: number) => setSel((prev) => toggleService(prev, id))
  const handleToggleExpressService = (id: number) =>
    setSel((prev) => toggleExpressService(prev, id))
  const toggleExpress = () => update({ express: !sel.express })

  const setDue = (type: OrderType, value: Date | null) => {
    const clamped = value && clampToOpeningHours(value, OPENING_HOURS)
    if (value && clamped && clamped.getTime() !== value.getTime())
      notify.info(`Ngoài giờ mở cửa, đã chuyển sang ${dayjs(clamped).format('DD/MM HH:mm')}`)
    setSel((prev) => ({
      ...prev,
      due: { ...prev.due, [type]: clamped },
      dueKey: { ...prev.dueKey, [type]: 'custom' },
    }))
  }
  const pickQuickDue = (type: OrderType, o: QuickDueOption) =>
    setSel((prev) => ({
      ...prev,
      due: { ...prev.due, [type]: o.date },
      dueKey: { ...prev.dueKey, [type]: o.key },
    }))
  const setWhites = (type: OrderType, checked: boolean) =>
    setSel((prev) => ({ ...prev, whites: { ...prev.whites, [type]: checked } }))

  const handleSubmit = form.onSubmit((values) => {
    if (blockReason || lookupPending || createIntake.isPending) return
    setOrderErrors({})
    createIntake.mutate(
      {
        requestId,
        customerPhone: phone,
        customerName: formatPersonName(values.customerName),
        orders: plans.map((p) => ({
          orderType: p.orderType,
          serviceIds: p.services.map((s) => s.id),
          dueAt: p.dueAt!.toISOString(),
          washWhitesSeparately: p.whites,
        })),
      },
      {
        onSuccess: (result) => {
          setRequestId(crypto.randomUUID())
          onCreated(result)
        },
        onError: (e) => {
          const err = toApiError(e)
          const fieldErrors: Record<string, string> = {}
          const perOrder: Partial<Record<OrderType, string>> = {}
          for (const [k, v] of Object.entries(err.fieldErrors)) {
            const m = /^orders\[(\d+)]/.exec(k)
            const plan = m && plans[Number(m[1])]
            if (plan) perOrder[plan.orderType] = v
            else if (FIELD_OF[k]) fieldErrors[FIELD_OF[k]] = v
          }
          form.setErrors(fieldErrors)
          setOrderErrors(perOrder)
          notify.error(err.message)
        },
      },
    )
  })

  const previewOf = (p: PlannedOrder<Service> | undefined): ReceiptData => ({
    orderCode: `LD-${dayjs(now).format('YYYYMMDD')}-…`,
    receivedAt: now.toISOString(),
    customerName: form.values.customerName.trim(),
    customerPhone: isValidPhone(phone) ? formatPhone(phone) : form.values.phone,
    dueAt: p?.dueAt ? p.dueAt.toISOString() : '',
    shopName: 'Tiệm Giặt Ủi',
    hotline: '',
    orderType: p?.orderType,
    intakeCode: plans.length > 1 ? `NH-${dayjs(now).format('YYYYMMDD')}-…` : null,
    intakeOrderIndex: p ? plans.indexOf(p) + 1 : 1,
    intakeOrderCount: plans.length,
    washWhitesSeparately: p?.whites ?? false,
    whitesFee: whitesFee ?? 0,
    services: p?.services.map((s) => ({
      name: s.name,
      unit: s.unit ?? 'PIECE',
      unitPrice: s.price,
      expressSurcharge: p.orderType === 'EXPRESS' ? s.expressSurcharge : null,
      minQuantity: s.minQuantity,
    })),
  })
  const handleTabChange = (v: string) => setTab(v as OrderType)
  const tabOptions = plans.map((p, i) => ({
    value: p.orderType,
    label: `Phiếu ${i + 1} · ${TAB_LABEL[p.orderType]}`,
  }))

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

  const servicesBody = servicesLoading ? (
    <Center py="md">
      <Loader size="sm" />
    </Center>
  ) : services.length ? (
    <ServicePicker
      services={services}
      selectedIds={sel.serviceIds}
      expressIds={sel.express ? sel.expressIds : []}
      onToggle={handleToggleService}
    />
  ) : (
    <EmptyState
      icon={<LuTags size={32} />}
      title="Chưa có dịch vụ đang hoạt động"
      description="Admin cần thêm hoặc kích hoạt dịch vụ ở trang Bảng giá dịch vụ."
    />
  )

  const splitMessage = !plans.length
    ? 'Chọn dịch vụ ở bước 2 để xem đơn.'
    : plans.length === 1
      ? `Lượt nhận này tạo 1 đơn (${TAB_LABEL[plans[0].orderType].toLowerCase()}).`
      : 'Lượt nhận này tách thành 2 đơn: phần giặt nhanh làm và hẹn trả riêng. Đồ để 2 túi riêng, mỗi túi kẹp một liên phiếu.'

  const previewPlan = plans.find((p) => p.orderType === activeTab)

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
        onChange={(e) => setFieldValue('phone', formatPhoneTyping(e.currentTarget.value))}
        rightSection={lookupPending ? <Loader size="xs" /> : undefined}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || customer) return
          e.preventDefault()
          if (!nameLocked) nameRef.current?.focus()
        }}
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
        onChange={(e) => setFieldValue('customerName', stripDigits(e.currentTarget.value))}
        onBlur={(e) => {
          setFieldValue('customerName', formatPersonName(e.currentTarget.value))
          form.getInputProps('customerName').onBlur?.()
        }}
      />
    </>
  )

  const orderPlans = (
    <>
      <Text
        size="sm"
        c="dimmed"
        bg="var(--ds-muted)"
        p="sm"
        style={{ borderRadius: 'var(--radius-control)' }}
      >
        {splitMessage}
      </Text>
      {plans.map((p) => (
        <PlannedOrderCard
          key={p.orderType}
          plan={p}
          dueKey={sel.dueKey[p.orderType]}
          now={now}
          whitesFee={whitesFee}
          error={orderErrors[p.orderType]}
          onDueChange={(v) => setDue(p.orderType, v)}
          onQuickDue={(o) => pickQuickDue(p.orderType, o)}
          onWhitesChange={(c) => setWhites(p.orderType, c)}
        />
      ))}
    </>
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
        {ctaLabel(Math.max(plans.length, 1))}
      </Button>
      <Text size="sm" c="dimmed" ta="center" aria-live="polite" mih={20}>
        {blockReason}
      </Text>
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
        {plans.length > 1 && (
          <SegmentedControl
            fullWidth
            value={activeTab}
            onChange={handleTabChange}
            data={tabOptions}
          />
        )}
        {/* Phiếu dài hơn màn hình thì cuộn bên trong, khung xem trước vẫn đứng yên */}
        <Box mih={0} style={{ flex: 1, overflowY: twoColumns ? 'auto' : undefined }}>
          <ReceiptSheet data={previewOf(previewPlan)} copies={1} />
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

            <Step
              n={2}
              title="Dịch vụ khách mang đến"
              aside={sel.serviceIds.length ? `Đã chọn ${sel.serviceIds.length}` : 'Chưa chọn'}
            >
              {servicesBody}
            </Step>

            <Step n={3} title="Yêu cầu thêm">
              <ExpressPicker
                services={selectedServices}
                enabled={sel.express}
                expressIds={sel.expressIds}
                onToggleEnabled={toggleExpress}
                onToggleService={handleToggleExpressService}
              />
            </Step>

            <Step n={4} title="Đơn sẽ tạo">
              {orderPlans}
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
