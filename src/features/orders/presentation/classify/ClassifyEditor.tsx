import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  FileButton,
  Grid,
  Group,
  Image,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import { LuCalendarClock, LuCamera, LuPlus } from 'react-icons/lu'
import { useBlocker } from 'react-router-dom'
import { formatPhone } from '@/features/customers'
import { useActiveServices, type Service } from '@/features/services'
import { useShopSettings } from '@/features/settings'
import { toApiError } from '@/shared/api/apiError'
import { formatDateTime } from '@/shared/lib/format'
import { useObjectUrl } from '@/shared/hooks/useObjectUrl'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, EntityCode, InfoLabel } from '@/shared/ui'
import { useOrderDraft } from '../../application/useOrderDraft'
import { useSaveClassification } from '../../application/mutations/useSaveClassification'
import { checkVoucherCode } from '../../application/voucherCheck'
import { computeTotals, lineExpressSurcharge } from '../../domain/pricing'
import { isV3, splitImages, validateLine } from '../../domain/rules'
import {
  ORDER_TYPE_LABEL,
  type OrderDetail,
  type OrderLine,
  type OrderType,
} from '../../domain/types'
import { ClassifyServiceList } from './ClassifyServiceList'
import { ItemLineEditor } from './ItemLineEditor'
import { RescheduleModal } from '../modals/RescheduleModal'
import { FIT_VIEWPORT, STICKY_ASIDE, TWO_COLUMNS_QUERY } from '../stickyAside'
import { TotalsCard } from './TotalsCard'
import { VoucherField } from './VoucherField'

const emptyLine = (): OrderLine => ({
  itemType: '',
  serviceId: 0,
  unit: 'KG',
  quantity: '',
  unitPrice: 0,
  conditionTags: [],
  conditionText: '',
  localImages: [],
})

const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

/** Dòng gợi ý từ dịch vụ (đơn v3): giá và tối thiểu theo bảng giá hiện hành, chốt khi lưu. */
const withServicePrice = (line: OrderLine, s: Service): OrderLine => ({
  ...line,
  itemType: s.name,
  serviceId: s.id,
  unit: s.unit ?? 'PIECE',
  unitPrice: s.price,
  minQuantity: s.minQuantity,
})

/** So sánh để biết có thay đổi chưa lưu (ảnh tính riêng vì File không serialize được). */
const snapshot = (orderType: OrderType, lines: OrderLine[], voucherCode: string | null) =>
  JSON.stringify({
    orderType,
    voucherCode,
    lines: lines.map((l) => ({ ...l, localImages: l.localImages.length })),
  })

interface ClassifyEditorProps {
  order: OrderDetail
  onSaved: () => void
}

/** Phần chính WF-C03 cho một đơn. Remount theo `key={order.id}` khi đổi đơn. */
export function ClassifyEditor(props: ClassifyEditorProps) {
  const { data: services = [], isLoading } = useActiveServices()
  if (isLoading)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  return <ClassifyEditorBody {...props} services={services} />
}

function ClassifyEditorBody({
  order,
  onSaved,
  services,
}: ClassifyEditorProps & { services: Service[] }) {
  const draftStore = useOrderDraft()
  const twoColumns = useMediaQuery(TWO_COLUMNS_QUERY)
  const v3 = isV3(order)
  const serviceMap = useMemo(
    () => new Map<number, Service>(services.map((s) => [s.id, s])),
    [services],
  )
  const [initial] = useState(() => {
    const draft = draftStore.load(order.id)
    // Đơn v3: giá luôn theo bảng giá hiện hành (BE chốt lúc lưu); bỏ dòng không còn dịch vụ hợp lệ
    // (dòng trống / dịch vụ ngừng hoạt động từ nháp cũ) vì checklist chỉ hiển thị được dòng có dịch vụ
    const priced = (lines: OrderLine[]) =>
      v3
        ? lines.flatMap((l) => {
            const s = serviceMap.get(l.serviceId)
            return s ? [withServicePrice(l, s)] : []
          })
        : lines
    const suggested = order.requestedServices.flatMap((r) => {
      const s = serviceMap.get(r.id)
      return s ? [withServicePrice(emptyLine(), s)] : []
    })
    const base = {
      orderType: order.orderType,
      lines: order.items.length ? priced(order.items) : v3 ? suggested : [emptyLine()],
      voucherCode: null as string | null,
    }
    const fromDraft = draft && {
      // Loại đơn v3 cố định từ lúc tạo
      orderType: v3 ? order.orderType : draft.orderType,
      lines: priced(draft.lines.map((l) => ({ ...l, localImages: [] }))),
      voucherCode: draft.voucherCode,
    }
    return { base, start: fromDraft ?? base, draftSavedAt: draft?.savedAt ?? null }
  })
  const inactiveRequested = order.requestedServices.filter((r) => !serviceMap.has(r.id))
  const settingsFee = useShopSettings().data?.whitesFee ?? 0
  const whitesFee = v3 && order.washWhitesSeparately ? settingsFee : 0
  const [orderType, setOrderType] = useState(initial.start.orderType)
  const [lines, setLines] = useState<OrderLine[]>(initial.start.lines)
  const [voucherCode, setVoucherCode] = useState(initial.start.voucherCode)
  const [bagImages, setBagImages] = useState<File[]>([])
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshot(initial.base.orderType, initial.base.lines, initial.base.voucherCode),
  )
  const [submitted, setSubmitted] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)

  const save = useSaveClassification()

  const subtotalOnly = computeTotals(lines, orderType, serviceMap).subtotal
  const voucher = voucherCode ? checkVoucherCode(voucherCode, subtotalOnly) : null
  const discount = voucher?.check.ok ? voucher.check.discount : 0
  const totals = computeTotals(lines, orderType, serviceMap, discount, whitesFee)
  const lineErrors = lines.map(validateLine)
  const hasErrors = lineErrors.some((e) => Object.keys(e).length > 0)

  const dirty = snapshot(orderType, lines, voucherCode) !== savedSnapshot || bagImages.length > 0

  // Rời trang khi còn thay đổi chưa lưu
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return dirty && !save.isPending && currentLocation.pathname !== nextLocation.pathname
  })
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const updateLine = (i: number, patch: Partial<OrderLine>) =>
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const toggleService = (s: Service) =>
    setLines((prev) =>
      prev.some((l) => l.serviceId === s.id)
        ? prev.filter((l) => l.serviceId !== s.id)
        : [...prev, withServicePrice(emptyLine(), s)],
    )
  const updateServiceLine = (serviceId: number, patch: Partial<OrderLine>) =>
    setLines((prev) => prev.map((l) => (l.serviceId === serviceId ? { ...l, ...patch } : l)))
  const requestedIds = order.requestedServices.map((r) => r.id)

  const saveDraft = () => {
    const ok = draftStore.save(order.id, {
      orderType,
      voucherCode,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- bỏ ảnh khỏi nháp
      lines: lines.map(({ localImages, ...rest }) => rest),
      savedAt: new Date().toISOString(),
    })
    if (!ok) return notify.error('Trình duyệt không cho lưu nháp')
    setSavedSnapshot(snapshot(orderType, lines, voucherCode))
    notify.success('Ảnh chưa được lưu kèm nháp', 'Đã lưu nháp trên máy này')
  }

  const saveAndStart = () => {
    setSubmitted(true)
    if (!lines.length || hasErrors) return
    save.mutate(
      {
        orderId: order.id,
        discountAmount: v3 ? discount : undefined,
        items: lines.map((line) => ({
          line,
          expressSurcharge: lineExpressSurcharge(orderType, serviceMap.get(line.serviceId)),
        })),
      },
      {
        onSuccess: ({ failedImages }) => {
          draftStore.clear(order.id)
          setSavedSnapshot(snapshot(orderType, lines, voucherCode))
          setBagImages([])
          notify.success('Đơn đã chuyển sang Đang xử lý', 'Đã lưu phân loại')
          if (failedImages)
            notify.error(
              'Dòng đồ đã được lưu, chỉ thiếu ảnh.',
              `${failedImages} ảnh tình trạng chưa tải lên được`,
            )
          onSaved()
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    )
  }

  const blockReason = !lines.length
    ? 'Đơn phải có ít nhất một dòng đồ'
    : hasErrors
      ? 'Còn dòng đồ chưa hợp lệ'
      : null

  const notices = (
    <>
      {inactiveRequested.length > 0 && (
        <Alert color="warning" variant="light" mb="lg">
          {`Dịch vụ đã chọn lúc nhận đồ nay ngừng hoạt động: ${inactiveRequested
            .map((r) => r.name ?? `#${r.id}`)
            .join(', ')}. Chọn dịch vụ khác cho phần đồ này.`}
        </Alert>
      )}
      {initial.draftSavedAt && (
        <Alert color="info" variant="light" mb="lg">
          Đang mở bản nháp lưu lúc {dateTime(initial.draftSavedAt)}.
        </Alert>
      )}
    </>
  )

  const bagPhoto = (
    <Group gap="sm" p="sm" bg="var(--ds-muted)" style={{ borderRadius: 8 }} wrap="nowrap">
      {bagImages.length ? (
        bagImages.map((f, i) => <BagThumb key={`${f.name}-${i}`} file={f} />)
      ) : (
        <Box w={64} h={64} style={{ border: '1px dashed var(--ds-border)', borderRadius: 6 }} />
      )}
      <Text fw={500} style={{ flex: 1 }}>
        <InfoLabel info="Chụp khi mở túi để làm bằng chứng số lượng. Ảnh chưa được lưu lên hệ thống (chờ backend).">
          Ảnh tổng thể túi đồ
        </InfoLabel>
      </Text>
      <FileButton
        accept="image/png,image/jpeg"
        capture="environment"
        onChange={(f) => {
          if (!f) return
          const { ok, rejected } = splitImages([f])
          if (rejected) notify.error('Chỉ nhận ảnh PNG/JPG, tối đa 5MB')
          setBagImages(ok)
        }}
      >
        {(props) => (
          <Button
            {...props}
            size="xs"
            variant="subtle"
            color="neutral"
            leftSection={<LuCamera size={14} />}
            style={{ border: '1px dashed var(--ds-border)' }}
          >
            Chụp
          </Button>
        )}
      </FileButton>
    </Group>
  )

  const lineEditors = v3 ? (
    <ClassifyServiceList
      services={services}
      requestedIds={requestedIds}
      orderType={orderType}
      lines={lines}
      perLine={totals.perLine}
      errors={submitted ? lineErrors : lines.map(() => ({}))}
      onToggle={toggleService}
      onChange={updateServiceLine}
    />
  ) : (
    <>
      {lines.map((line, i) => (
        <ItemLineEditor
          key={i}
          index={i}
          line={line}
          services={services}
          orderType={orderType}
          lineTotal={totals.perLine[i]}
          errors={submitted ? lineErrors[i] : {}}
          onChange={(patch) => updateLine(i, patch)}
          onRemove={() => setLines((prev) => prev.filter((_, j) => j !== i))}
        />
      ))}
      <Button
        variant="secondary"
        fullWidth
        leftSection={<LuPlus size={16} />}
        onClick={() => setLines((prev) => [...prev, emptyLine()])}
      >
        Thêm dòng đồ
      </Button>
    </>
  )

  const orderSummary = (
    <Card>
      <Stack gap="md">
        <Stack gap={4}>
          <EntityCode code={order.orderCode} size="display" />
          <Text fw={500}>
            {order.customerName} · {formatPhone(order.customerPhone)}
          </Text>
          <Text size="sm" c="dimmed">
            Nhận {dateTime(order.receivedAt)}
          </Text>
        </Stack>
        <Divider />
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={2}>
            <Text size="sm" c="dimmed">
              Ngày hẹn trả
            </Text>
            <Text fw={600}>{dateTime(order.dueAt)}</Text>
          </Stack>
          <Button
            size="xs"
            variant="secondary"
            leftSection={<LuCalendarClock size={14} />}
            onClick={() => setRescheduling(true)}
          >
            Đổi
          </Button>
        </Group>
        {v3 ? (
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Loại đơn
            </Text>
            <Group gap={6}>
              <Badge color={orderType === 'EXPRESS' ? 'warning' : 'teal'} variant="light">
                {ORDER_TYPE_LABEL[orderType]}
              </Badge>
              {order.washWhitesSeparately && (
                <Badge color="gray" variant="light">
                  Đồ trắng
                </Badge>
              )}
            </Group>
          </Group>
        ) : (
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              Loại đơn
            </Text>
            <SegmentedControl
              fullWidth
              value={orderType}
              onChange={(v) => setOrderType(v as OrderType)}
              data={(['NORMAL', 'EXPRESS'] as const).map((v) => ({
                value: v,
                label: ORDER_TYPE_LABEL[v],
              }))}
            />
          </Stack>
        )}
        <VoucherField
          appliedCode={voucherCode}
          subtotal={totals.subtotal}
          onApply={setVoucherCode}
        />
      </Stack>
    </Card>
  )

  const saveActions = (
    <Stack gap="xs">
      <Tooltip label={blockReason} disabled={!submitted || !blockReason}>
        <Button size="lg" fullWidth loading={save.isPending} onClick={saveAndStart}>
          Lưu & bắt đầu xử lý
        </Button>
      </Tooltip>
      {submitted && blockReason && (
        <Text c="var(--ds-destructive)" ta="center" size="sm" role="alert">
          {blockReason}
        </Text>
      )}
      <Button variant="subtle" fullWidth onClick={saveDraft}>
        Lưu nháp
      </Button>
    </Stack>
  )

  return (
    <>
      {notices}
      <Grid gap="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={5}>Chi tiết đồ giặt</Title>
                <Text size="sm" c="dimmed">
                  {v3 ? `Đã chọn ${lines.length} dịch vụ` : `${lines.length} dòng`}
                </Text>
              </Group>
              {bagPhoto}
              {lineEditors}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} style={twoColumns ? STICKY_ASIDE : undefined}>
          {/* Ghim tổng quan đơn + nút lưu; cột cao hơn màn hình thì cuộn bên trong */}
          <Stack gap="lg" style={twoColumns ? { ...FIT_VIEWPORT, overflowY: 'auto' } : undefined}>
            {orderSummary}
            <TotalsCard totals={totals} voucherCode={discount ? voucherCode : null} />
            {saveActions}
          </Stack>
        </Grid.Col>
      </Grid>

      {rescheduling && (
        <RescheduleModal
          orderId={order.id}
          currentDueAt={order.dueAt}
          onClose={() => setRescheduling(false)}
        />
      )}
      <ConfirmModal
        opened={blocker.state === 'blocked'}
        kind="destructive"
        title="Bỏ thay đổi chưa lưu?"
        confirmLabel="Bỏ thay đổi"
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      >
        Các dòng đồ vừa nhập cho đơn này sẽ mất nếu rời trang.
      </ConfirmModal>
    </>
  )
}

function BagThumb({ file }: { file: File }) {
  const url = useObjectUrl(file)
  return url ? (
    <Image src={url} w={64} h={64} radius="sm" fit="cover" alt="Ảnh túi đồ" />
  ) : (
    <Box w={64} h={64} />
  )
}
