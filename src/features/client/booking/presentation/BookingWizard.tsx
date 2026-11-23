import { Loader } from '@mantine/core'
import { schemaResolver } from '@mantine/form'
import { useRef, useState, type FormEvent } from 'react'
import { LuShirt } from 'react-icons/lu'
import {
  CallButton,
  SectionError,
  usePublicServiceAreas,
  usePublicServices,
  usePublicStore,
  usePublicWashModes,
  type PublicService,
  type PublicServiceArea,
  type PublicWashMode,
  type PublicStore,
} from '@/features/client/public-site'
import { useMyProfile } from '@/features/client/customer-account'
import { EmptyState } from '@/shared/client/ui'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { BookingFormProvider, useBookingForm } from '../application/bookingForm'
import { useCreateBooking } from '../application/mutations/useCreateBooking'
import { useBookingSettings } from '../application/queries/useBookingSettings'
import { stepSchema } from '../application/schemas'
import { stepOfField, toFormPath, type BookingStep } from '../domain/draft'
import type { BookingSettings } from '../domain/types'
import { BookingClosed } from './BookingClosed'
import { BookingSuccess } from './BookingSuccess'
import { StepNumber, StepProgress } from './StepProgress'
import { SubmitErrorAlert } from './SubmitErrorAlert'
import { StepContact } from './steps/StepContact'
import { StepMethod } from './steps/StepMethod'
import { StepReview } from './steps/StepReview'
import { StepServices } from './steps/StepServices'
import { StepTime } from './steps/StepTime'
import './booking.css'

const STEP_TITLE: Record<BookingStep, string> = {
  1: 'Chọn dịch vụ',
  2: 'Gửi đồ và nhận lại',
  3: 'Ngày giờ hẹn',
  4: 'Thông tin liên hệ',
  5: 'Xác nhận yêu cầu',
}

const STEP_HINT: Record<BookingStep, string> = {
  1: 'Chọn một hoặc nhiều dịch vụ, tiệm báo giá sau khi cân',
  2: 'Anh/chị mang đồ đến tiệm hay để tiệm đến tận nơi?',
  3: 'Chọn giờ thuận tiện, tiệm sẽ gọi xác nhận lại',
  4: 'Để tiệm liên hệ xác nhận yêu cầu với anh/chị',
  5: 'Anh/chị xem lại thông tin trước khi gửi nhé',
}

interface FlowProps {
  services: PublicService[]
  modes: PublicWashMode[]
  areas: PublicServiceArea[]
  store: PublicStore
  settings: BookingSettings
  mutation: ReturnType<typeof useCreateBooking>
  /** Tải lại booking-settings và bảng giá công khai khi BE chặn / báo dịch vụ ngừng. */
  onStale: () => void
}

type SubmitAlert = { variant: 'block' | 'rateLimit' | 'generic'; detail?: string }

const SERVICE_ID_KEY = /^items\[(\d+)\]\.serviceId$/

// Ô lỗi đầu tiên theo thứ tự trên trang: input aria-invalid, thông báo lỗi của một nhóm Mantine (id …-error) hoặc lỗi chung của bước.
const INVALID = '[aria-invalid="true"], [id$="-error"], [data-error-focus]'

function focusFirstInvalid(root: HTMLElement | null) {
  const el = root?.querySelector<HTMLElement>(INVALID)
  if (!el?.id.endsWith('-error')) return el?.focus()
  el.parentElement
    ?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, button')
    ?.focus()
}

/** Năm bước + tạm tính; unmount khi gửi thành công nên "Đặt đơn mới" mount lại với form trống và tự điền lại hồ sơ. */
function BookingFlow({ services, modes, areas, store, settings, mutation, onStale }: FlowProps) {
  const profile = useMyProfile().data
  const { form, step, setStep } = useBookingForm({
    profile,
    services,
    modes,
    areas,
    settings,
    store,
  })
  const [alert, setAlert] = useState<SubmitAlert | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const goTo = (s: BookingStep) => {
    setStep(s)
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }

  const next = () => {
    const ctx = { services, modes, areas, settings, store, now: Date.now() }
    const errors = schemaResolver(stepSchema(step, ctx), { sync: true })(form.getValues())
    form.setErrors(errors)
    if (Object.keys(errors).length > 0) setTimeout(() => focusFirstInvalid(formRef.current))
    else if (step < 5) goTo((step + 1) as BookingStep)
  }

  const back = () => goTo((step - 1) as BookingStep)

  const onSubmitError = (e: unknown) => {
    const err = toApiError(e)
    // Refresh hỏng: onUnauthorized đã xoá phiên, CustomerRoute đưa về /login; nháp (step 5) đã lưu nên quay lại Bước 5.
    if (err.status === 401) return notify.error('Vui lòng đăng nhập để đặt đơn')
    if (err.status === 429) return setAlert({ variant: 'rateLimit', detail: err.message })
    if (err.status !== 400) return setAlert({ variant: 'generic' })
    const entries = Object.entries(err.fieldErrors)
    if (entries.length === 0) {
      setAlert({ variant: 'block', detail: err.message })
      return onStale()
    }

    const removed = new Set<number>()
    const errors: Record<string, string> = {}
    const unknown: string[] = []
    const svcMessages = new Set<string>()
    let target: BookingStep = 5
    for (const [key, message] of entries) {
      const s = stepOfField(key)
      const svc = SERVICE_ID_KEY.exec(key)
      if (svc) {
        removed.add(Number(svc[1]))
        svcMessages.add(message)
      } else if (s === 5) unknown.push(message)
      else errors[toFormPath(key)] = message
      if (s < target) target = s
    }

    const values = form.getValues()
    if (removed.size > 0) {
      // shortcut: lỗi items[j].* khác bị bỏ khi đã xoá dòng (chỉ số lệch); khách bấm Tiếp tục sẽ được kiểm lại.
      for (const k of Object.keys(errors)) if (k.startsWith('items.')) delete errors[k]
      form.setValues({ items: values.items.filter((_, i) => !removed.has(i)) })
      notify.error([...svcMessages].join(' '))
      onStale()
    }
    if ('pickupAreaId' in errors || 'deliveryAreaId' in errors)
      form.setValues({ pickupAreaId: null, deliveryAreaId: null })
    form.setErrors(errors)
    // Khóa lạ: chặn gửi nếu chỉ có chúng; kèm lỗi sửa được thì vẫn cho "Gửi lại" sau khi sửa.
    setAlert(
      unknown.length > 0
        ? { variant: target === 5 ? 'block' : 'rateLimit', detail: unknown.join(' ') }
        : null,
    )
    if (target < 5) goTo(target)
  }

  const submit = () => {
    if (mutation.isPending) return
    setAlert(null)
    // mutateAsync: promise vẫn về khi trang đã unmount (401 → CustomerRoute chuyển /login).
    mutation.mutateAsync({ values: form.getValues(), services }).catch(onSubmitError)
  }

  // Enter trong ô nhập = "Tiếp tục"; Bước 5 chỉ gửi bằng nút "Gửi yêu cầu".
  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (step < 5) next()
  }

  return (
    <BookingFormProvider form={form}>
      <form
        ref={formRef}
        noValidate
        onSubmit={onFormSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8"
      >
        <StepProgress step={step} titles={STEP_TITLE} onGoTo={goTo} disabled={mutation.isPending} />
        <div className="bk-card flex flex-col gap-6">
          <div className="bk-card-head">
            <StepNumber step={step} state="current" />
            <div className="min-w-0">
              <h2 ref={headingRef} tabIndex={-1}>
                {STEP_TITLE[step]}
              </h2>
              <p className="text-(--pub-ink-muted)">{STEP_HINT[step]}</p>
            </div>
          </div>

          {step === 1 && (
            <>
              {form.errors.items && (
                <p
                  role="alert"
                  tabIndex={-1}
                  data-error-focus
                  className="text-(--pub-danger) outline-none"
                >
                  {form.errors.items}
                </p>
              )}
              <StepServices services={services} modes={modes} />
            </>
          )}
          {step === 2 && (
            <StepMethod
              storeAddress={store.address ?? ''}
              store={store}
              areas={areas}
              settings={settings}
              storePhone={store.phone}
            />
          )}
          {step === 3 && <StepTime store={store} settings={settings} modes={modes} />}
          {step === 4 && <StepContact />}
          {step === 5 && alert && (
            <SubmitErrorAlert
              variant={alert.variant}
              detail={alert.detail}
              storePhone={store.phone}
              onRetry={submit}
            />
          )}
          {step === 5 && (
            <StepReview services={services} modes={modes} areas={areas} onEdit={goTo} />
          )}

          {/* Quay lại luôn bên trái, nút chính (Tiếp tục / Gửi yêu cầu) luôn bên phải */}
          <div className="grid grid-cols-2 gap-3 border-t border-(--pub-border) bg-(--pub-surface) pt-5 lg:sticky lg:bottom-0 lg:z-10 lg:pb-5">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                disabled={mutation.isPending}
                className="pub-btn pub-btn--ghost pub-btn--lg"
              >
                Quay lại
              </button>
            )}
            {step < 5 ? (
              <button
                type="submit"
                className={`pub-btn pub-btn--primary pub-btn--lg ${step === 1 ? 'col-span-2 sm:col-span-1' : ''} sm:col-start-2`}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={alert?.variant === 'block' || mutation.isPending}
                aria-busy={mutation.isPending}
                className={`pub-btn pub-btn--primary pub-btn--lg ${step === 1 ? 'col-span-2 sm:col-span-1' : ''} sm:col-start-2`}
              >
                {mutation.isPending ? 'Đang gửi…' : 'Gửi yêu cầu'}
              </button>
            )}
          </div>
        </div>
      </form>
    </BookingFormProvider>
  )
}

/** Trang đặt đơn: tải dữ liệu, rồi luồng 5 bước hoặc màn thành công. */
export function BookingWizard() {
  const settings = useBookingSettings()
  const store = usePublicStore()
  const services = usePublicServices()
  const modes = usePublicWashModes()
  const areas = usePublicServiceAreas()
  const mutation = useCreateBooking()
  const queries = [settings, store, services, modes, areas]
  const phone = store.data?.phone ?? null
  const retry = () => queries.forEach((q) => q.isError && void q.refetch())

  let content
  if (mutation.isSuccess) {
    content = (
      <BookingSuccess
        result={mutation.data}
        storePhone={phone}
        services={services.data ?? []}
        onNewBooking={mutation.reset}
      />
    )
  } else if (queries.some((q) => q.isError)) {
    content = (
      <div className="flex flex-col gap-4">
        <SectionError what="thông tin đặt đơn" onRetry={retry} />
        <CallButton phone={phone} />
      </div>
    )
  } else if (!settings.data || !store.data || !services.data || !modes.data || !areas.data) {
    content = (
      <div className="flex justify-center py-16">
        <Loader color="var(--pub-primary)" aria-label="Đang tải" />
      </div>
    )
  } else if (!settings.data.bookingEnabled) {
    content = (
      <BookingClosed
        storePhone={phone}
        openingTime={store.data.openingTime}
        closingTime={store.data.closingTime}
      />
    )
  } else if (services.data.length === 0) {
    content = (
      <EmptyState
        icon={<LuShirt size={32} />}
        title="Tiệm chưa có dịch vụ nhận đặt trực tuyến"
        description="Anh/chị vui lòng gọi tiệm để đặt đơn."
        action={<CallButton phone={phone} />}
      />
    )
  } else {
    content = (
      <BookingFlow
        services={services.data}
        modes={modes.data}
        areas={areas.data}
        store={store.data}
        settings={settings.data}
        mutation={mutation}
        onStale={() => {
          void settings.refetch()
          void services.refetch()
          void modes.refetch()
        }}
      />
    )
  }

  return (
    <div data-booking>
      <div className="pub-container flex flex-col gap-6 pt-8 pb-12 lg:py-12">
        <h1 className="pub-h2">Đặt đơn giặt</h1>
        {content}
      </div>
    </div>
  )
}
