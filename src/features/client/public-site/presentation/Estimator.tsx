import {
  Checkbox,
  Loader,
  SegmentedControl,
  Select,
  Skeleton,
  TextInput,
  type ComboboxProps,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { type ChangeEvent, useMemo } from 'react'
import { LuCalculator, LuInfo, LuRotateCw, LuTriangleAlert } from 'react-icons/lu'
import { UNIT_LABEL } from '../domain/types'
import { formatMoney, formatNumber } from '@/shared/common/lib/format'
import { usePublicServiceAreas } from '../application/queries/usePublicServiceAreas'
import { usePublicServices } from '../application/queries/usePublicServices'
import { estimateFormSchema } from '../application/schemas'
import { estimate, rematch } from '../domain/estimate'
import type {
  EstimateInput,
  EstimateResult,
  PublicService,
  PublicServiceArea,
} from '../domain/types'
import { formatFee } from './formatFee'
import { SectionError } from './SectionError'
import { SectionHeading } from './SectionHeading'
import { StoreContactCards } from './StoreContactCards'

const TITLE_ID = 'uoc-tinh-title'
const TITLE = (
  <>
    Ước tính <span className="pub-accent-word">nhanh</span>
  </>
)
const INITIAL_VALUES: EstimateInput = {
  service: null,
  quantity: '',
  express: false,
  mode: 'IN_STORE',
  area: null,
  pickup: true,
  delivery: true,
}
const VALIDATE_ON_BLUR = ['quantity']
const NOOP = () => {}
const NO_AREAS: PublicServiceArea[] = []
// Dropdown nằm trong section để nhận token --pub-* (portal ra body thì mất)
const COMBOBOX_PROPS: ComboboxProps = { withinPortal: false, shadow: 'md' }
const FIELD_CLASSES = {
  label: 'mb-1.5! font-semibold! text-(length:--pub-text-md)! text-(--pub-ink)!',
  input:
    'h-12! rounded-(--pub-radius-btn)! border-(--pub-border)! bg-(--pub-surface)! text-(length:--pub-text-md)! focus:border-(--pub-primary)!',
  error: 'mt-1.5! text-(length:--pub-text-sm)! text-(--pub-danger)!',
  section: 'pr-3! text-(--pub-ink-muted)!',
  dropdown: 'rounded-(--pub-radius-md)! border-(--pub-border)!',
  option: 'py-2.5! text-(length:--pub-text-md)!',
}
// Cả hàng (≥ 44 px) bấm được: label cao bằng hàng và căn giữa theo ô tích
const CHECKBOX_CLASSES = {
  body: 'min-h-(--pub-touch)! items-center!',
  labelWrapper: 'self-stretch!',
  label:
    'flex! min-h-(--pub-touch)! cursor-pointer! items-center! data-disabled:cursor-not-allowed! text-(length:--pub-text-md)! text-(--pub-ink)!',
}
const SEGMENT_CLASSES = {
  root: 'w-full rounded-(--pub-radius-md)! bg-(--pub-surface-alt)! p-1!',
  label:
    'min-h-11! whitespace-normal! py-2! font-semibold! leading-tight! text-(length:--pub-text-sm)!',
}
const NOTE = 'Tổng ước tính chỉ để tham khảo, số tiền chính thức tính khi tiệm cân, đếm đồ.'

const serviceLabel = (s: PublicService, duplicated: boolean) =>
  duplicated ? `${s.name} (${formatMoney(s.price)}/${UNIT_LABEL[s.unit]})` : s.name

function EstimatorSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="pub-card grid gap-5 p-6 sm:grid-cols-2">
        <Skeleton h={72} />
        <Skeleton h={72} />
        <Skeleton h={24} w="40%" />
        <Skeleton h={48} radius="sm" className="sm:col-span-2" />
      </div>
      <Skeleton h={200} radius="md" />
    </div>
  )
}

interface ResultPanelProps {
  result: EstimateResult | null
  service: PublicService | null
  express: boolean
  hint: string
}

/** Một vùng aria-live duy nhất: đổi gì cũng đọc lại cả bảng kết quả, ghi chú để ngoài cho đỡ lặp. */
function ResultPanel({ result, service, express, hint }: ResultPanelProps) {
  const unit = service ? UNIT_LABEL[service.unit] : ''
  let content
  if (!result || !service)
    content = (
      <p className="flex items-start gap-3 text-(length:--pub-text-lg) font-semibold">
        <LuCalculator size={28} className="flex-none" aria-hidden="true" />
        {hint}
      </p>
    )
  else
    content = (
      <dl className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt>
            Tạm tính
            <span className="block text-(length:--pub-text-sm) text-white/80">
              {formatNumber(result.billableQty)} {unit} × {formatMoney(service.price)}
            </span>
          </dt>
          <dd className="font-bold tabular-nums">{formatMoney(result.subtotal)}</dd>
        </div>
        {result.belowMinimum && (
          <p className="rounded-(--pub-radius-md) bg-white/15 px-3 py-2 text-(length:--pub-text-sm) font-semibold">
            Tính tối thiểu {formatNumber(service.minQuantity)} {unit}
          </p>
        )}
        {express && (
          <div className="flex items-baseline justify-between gap-4">
            <dt>Phụ phí giặt nhanh</dt>
            <dd className="font-bold tabular-nums">{formatMoney(result.expressFee)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <dt>Phí giao nhận</dt>
          <dd className="font-bold tabular-nums">{formatFee(result.deliveryFee)}</dd>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 border-t border-white/30 pt-4">
          <dt className="font-bold">Tổng ước tính</dt>
          <dd className="font-(family-name:--pub-font-display) text-4xl font-extrabold tabular-nums">
            {formatMoney(result.total)}
          </dd>
        </div>
      </dl>
    )

  return (
    <div className="relative flex flex-col gap-5 overflow-hidden rounded-(--pub-radius-lg) bg-(--pub-primary) p-6 text-(--pub-on-primary) sm:p-8">
      <span
        aria-hidden="true"
        className="absolute -top-20 -right-12 h-44 w-32 rounded-b-full bg-(--pub-orchid)/35"
      />
      <div className="relative" aria-live="polite" aria-atomic="true">
        {content}
      </div>
      <p className="relative flex items-start gap-2 text-(length:--pub-text-sm) text-white/90">
        <LuInfo size={18} className="mt-0.5 flex-none" aria-hidden="true" />
        {NOTE}
      </p>
    </div>
  )
}

interface EstimatorFormProps {
  services: PublicService[]
  areas: ReturnType<typeof usePublicServiceAreas>
}

function EstimatorForm({ services, areas }: EstimatorFormProps) {
  const form = useForm<EstimateInput>({
    initialValues: INITIAL_VALUES,
    validate: schemaResolver(estimateFormSchema(services), { sync: true }),
    validateInputOnBlur: VALIDATE_ON_BLUR,
  })
  const values = form.getValues()
  const areaList = areas.data ?? NO_AREAS
  const doorAvailable = areas.isSuccess && areaList.length > 0
  const doorHidden = areas.isSuccess && areaList.length === 0

  // Khớp lại lúc render thay vì effect: khi dữ liệu tải lại, lựa chọn không còn trong danh sách coi như chưa chọn
  const servicePick = rematch(values.service, services)
  const areaPick = rematch(values.area, areaList)
  const serviceLost = values.service !== null && servicePick === null
  const areaLost = areas.isSuccess && values.area !== null && areaPick === null

  const service = servicePick ? services[servicePick.index] : null
  const unit = service ? UNIT_LABEL[service.unit] : null
  const expressSupported = !!service?.expressSupported
  const express = values.express && expressSupported
  const mode = doorAvailable ? values.mode : 'IN_STORE'
  const area = mode === 'DOOR' && areaPick ? areaList[areaPick.index] : null
  const needsArea = mode === 'DOOR' && !area
  const result =
    service && !needsArea
      ? estimate({ ...values, service: servicePick, area: areaPick, express, mode }, service, area)
      : null
  const hint =
    service && needsArea && estimate(values, service, null)
      ? 'Chọn khu vực để xem phí giao nhận và tổng ước tính.'
      : 'Chọn dịch vụ và nhập số lượng để xem ước tính.'

  // Gõ số lượng render lại cả form mỗi phím; giữ nguyên mảng data để Select không dựng lại danh sách
  const serviceOptions = useMemo(() => {
    const nameCount = new Map<string, number>()
    services.forEach((s) => nameCount.set(s.name, (nameCount.get(s.name) ?? 0) + 1))
    return services.map((s, i) => ({
      value: String(i),
      label: serviceLabel(s, (nameCount.get(s.name) ?? 0) > 1),
    }))
  }, [services])
  const areaOptions = useMemo(
    () => areaList.map((a, i) => ({ value: String(i), label: a.name })),
    [areaList],
  )
  const modeOptions = useMemo(
    () => [
      { value: 'IN_STORE', label: 'Mang đến và nhận tại tiệm' },
      { value: 'DOOR', label: 'Lấy, giao tận nơi', disabled: !doorAvailable },
    ],
    [doorAvailable],
  )

  const handleSubmit = form.onSubmit(NOOP)
  const handleServiceChange = (value: string | null) => {
    const next = value === null ? null : services[Number(value)]
    form.setValues({
      service: next ? { index: Number(value), name: next.name } : null,
      express: next?.expressSupported ? values.express : false,
    })
    if (form.isTouched('quantity')) form.validateField('quantity')
  }
  const handleExpressChange = (e: ChangeEvent<HTMLInputElement>) =>
    form.setFieldValue('express', e.currentTarget.checked)
  const handleModeChange = (value: string) =>
    form.setFieldValue('mode', value as EstimateInput['mode'])
  const handleAreaChange = (value: string | null) => {
    const next = value === null ? null : areaList[Number(value)]
    form.setValues({
      area: next ? { index: Number(value), name: next.name } : null,
      pickup: true,
      delivery: true,
    })
  }
  const handlePickupChange = (e: ChangeEvent<HTMLInputElement>) =>
    form.setFieldValue('pickup', e.currentTarget.checked)
  const handleDeliveryChange = (e: ChangeEvent<HTMLInputElement>) =>
    form.setFieldValue('delivery', e.currentTarget.checked)
  const handleAreasRetry = () => areas.refetch()

  const quantityProps = form.getInputProps('quantity')
  const quantityError = form.errors.quantity ? (
    <span role="alert">{form.errors.quantity}</span>
  ) : null
  const expressLabel =
    expressSupported && service?.expressSurcharge
      ? `Giặt nhanh (+${formatMoney(service.expressSurcharge)}/${unit})`
      : 'Giặt nhanh'

  const lostNotice = (serviceLost || areaLost) && (
    <div
      role="status"
      className="flex items-start gap-2 rounded-(--pub-radius-md) bg-(--pub-accent-soft) px-4 py-3 font-semibold sm:col-span-2"
    >
      <LuTriangleAlert
        size={20}
        className="mt-0.5 flex-none text-(--pub-accent-ink)"
        aria-hidden="true"
      />
      <div>
        {serviceLost && <p>Dịch vụ này vừa ngừng, vui lòng chọn lại.</p>}
        {areaLost && <p>Khu vực này vừa ngừng, vui lòng chọn lại.</p>}
      </div>
    </div>
  )

  const doorFields = mode === 'DOOR' && (
    <div className="pub-rise flex flex-col gap-4 rounded-(--pub-radius-md) bg-(--pub-surface-alt) p-4">
      <Select
        label="Khu vực"
        placeholder="Chọn khu vực của bạn"
        data={areaOptions}
        value={areaPick ? String(areaPick.index) : null}
        onChange={handleAreaChange}
        allowDeselect={false}
        comboboxProps={COMBOBOX_PROPS}
        classNames={FIELD_CLASSES}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <Checkbox
          label={area ? `Lấy tận nơi (${formatFee(area.pickupFee)})` : 'Lấy tận nơi'}
          checked={values.pickup}
          onChange={handlePickupChange}
          color="var(--pub-primary)"
          size="md"
          classNames={CHECKBOX_CLASSES}
        />
        <Checkbox
          label={area ? `Giao tận nơi (${formatFee(area.deliveryFee)})` : 'Giao tận nơi'}
          checked={values.delivery}
          onChange={handleDeliveryChange}
          color="var(--pub-primary)"
          size="md"
          classNames={CHECKBOX_CLASSES}
        />
      </div>
    </div>
  )

  const deliveryFields = !doorHidden && (
    <fieldset className="flex flex-col gap-3 sm:col-span-2">
      <legend className="mb-1.5 flex items-center gap-2 font-semibold">
        Hình thức giao nhận
        {areas.isPending && <Loader size="xs" color="var(--pub-primary)" aria-hidden="true" />}
      </legend>
      <SegmentedControl
        data={modeOptions}
        value={mode}
        onChange={handleModeChange}
        fullWidth
        color="var(--pub-primary)"
        radius="sm"
        classNames={SEGMENT_CLASSES}
      />
      {areas.isError && (
        <p className="flex flex-wrap items-center gap-x-3 text-(--pub-ink-muted)">
          Không tải được khu vực giao nhận.
          <button type="button" onClick={handleAreasRetry} className="pub-link">
            <LuRotateCw size={16} aria-hidden="true" />
            Thử lại
          </button>
        </p>
      )}
      {doorFields}
    </fieldset>
  )

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="pub-card grid items-start gap-5 bg-(--pub-bg)! p-6 sm:grid-cols-2 sm:p-8"
      >
        {lostNotice}
        <Select
          label="Dịch vụ"
          placeholder="Chọn dịch vụ"
          data={serviceOptions}
          value={servicePick ? String(servicePick.index) : null}
          onChange={handleServiceChange}
          allowDeselect={false}
          comboboxProps={COMBOBOX_PROPS}
          classNames={FIELD_CLASSES}
        />
        <TextInput
          {...quantityProps}
          label="Số lượng"
          placeholder="Ví dụ: 6"
          inputMode="decimal"
          autoComplete="off"
          rightSection={unit}
          error={quantityError}
          classNames={FIELD_CLASSES}
        />
        <Checkbox
          label={expressLabel}
          checked={express}
          onChange={handleExpressChange}
          disabled={!expressSupported}
          color="var(--pub-primary)"
          size="md"
          classNames={CHECKBOX_CLASSES}
        />
        {deliveryFields}
      </form>
      <ResultPanel result={result} service={service} express={express} hint={hint} />
    </div>
  )
}

/** Ước tính nhanh: khách tự tính tiền dự kiến theo bảng giá và phí giao nhận hiện hành. */
export function Estimator() {
  const services = usePublicServices()
  const areas = usePublicServiceAreas()
  const handleRetry = () => services.refetch()

  if (services.data?.length === 0) return null

  // Tải lại lỗi mà vẫn còn dữ liệu cũ thì giữ form, khách không mất phần đã nhập
  let body
  if (services.data) body = <EstimatorForm services={services.data} areas={areas} />
  else if (services.isPending) body = <EstimatorSkeleton />
  else body = <SectionError what="bảng giá để ước tính" onRetry={handleRetry} />

  return (
    <section
      id="uoc-tinh"
      aria-labelledby={TITLE_ID}
      aria-busy={services.isPending}
      className="pub-section bg-(--pub-surface)"
    >
      <div className="pub-container">
        <SectionHeading id={TITLE_ID} eyebrow="Tính thử" title={TITLE}>
          Chọn dịch vụ, nhập số lượng và biết ngay số tiền dự kiến.
        </SectionHeading>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-16">
          <StoreContactCards />
          <div className="min-w-0">{body}</div>
        </div>
      </div>
    </section>
  )
}
