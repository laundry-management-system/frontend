import { useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Input, Stack } from '@mantine/core'
import { LuCheck, LuPackageCheck, LuPackagePlus } from 'react-icons/lu'
import { InfoTip } from '../InfoTip'
import { useBookingFormContext } from '../../application/bookingForm'
import { appointmentSlots, returnSlots, toAppointmentIso, vnToday } from '../../domain/appointment'
import { gapHoursOf, TIER_LABEL } from '../../domain/draft'
import type { BookingSettings, BookingStore } from '../../domain/types'

interface Props {
  store: BookingStore
  settings: BookingSettings
}

// Ngày dạng YYYY-MM-DD (giờ VN): đọc thứ theo UTC để không lệch múi giờ của máy.

const WEEKDAY_FULL = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const HOURS_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-3'
const DAY_MS = 86_400_000

/** Ngày dạng tờ lịch; vẫn là nút bật/tắt (aria-pressed) với nhãn đọc đầy đủ. */
function DateCard({ date, today, selected, onPick }: {
  date: string
  today: string
  selected: boolean
  onPick: () => void
}) {
  const tomorrow = new Date(Date.parse(`${today}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10)
  const caption = date === today ? 'Hôm nay' : date === tomorrow ? 'Ngày mai' : ''
  const idx = new Date(`${date}T00:00:00Z`).getUTCDay()
  const full = `${WEEKDAY_FULL[idx]}, ${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}${caption ? `, ${caption.toLowerCase()}` : ''}`
  return (
    <button type="button" aria-pressed={selected} aria-label={full} onClick={onPick} className="bk-date">
      <span className="bk-date-band" aria-hidden="true">
        Th {Number(date.slice(5, 7))}
        {selected && <LuCheck size={14} className="bk-date-check" />}
      </span>
      <span className="bk-date-day bk-money" aria-hidden="true">{date.slice(8, 10)}</span>
      <span className="bk-date-wd" aria-hidden="true">{idx === 0 ? 'CN' : `Thứ ${idx + 1}`}</span>
      <span className="bk-date-cap" aria-hidden="true">{caption}</span>
    </button>
  )
}

/** Lưới nút giờ (bật/tắt, aria-pressed). */
function HourChips({ hours, selected, onPick }: {
  hours: readonly number[]
  selected: number | null
  onPick: (h: number) => void
}) {
  return hours.map((h) => (
    <button key={h} type="button" aria-pressed={selected === h} onClick={() => onPick(h)} className="bk-chip">
      {String(h).padStart(2, '0')}:00
    </button>
  ))
}

const returnTip = (store: BookingStore, gap: number) =>
  `Giờ nhận lại nằm trong giờ mở cửa ${store.openingTime} – ${store.closingTime}, sau giờ gửi đồ ít nhất ${gap} giờ và trong 3 ngày kể từ ngày gửi.`

/** Thẻ nhóm một phần của bước: tiêu đề, nội dung cách nhau 24px. */
function TimeCard({ icon, title, tip, children }: {
  icon: ReactNode
  title: string
  tip?: string
  children: ReactNode
}) {
  return (
    <section className="bk-panel p-6 flex flex-col gap-6">
      <header className="grid grid-cols-[1.5rem_1fr] items-center gap-x-3">
        <span aria-hidden="true" className="grid size-6 place-items-center text-(--pub-primary)">{icon}</span>
        <h3 className="inline-flex items-center gap-1 text-(length:--pub-text-lg) leading-6 font-bold">
          {title}
          {tip && <InfoTip label={tip} />}
        </h3>
      </header>
      {children}
    </section>
  )
}

/** Giờ nhận lại: chọn ngày rồi giờ trong returnSlots của giờ gửi. */
function ReturnBlock({ dropoffIso, store, gap, today }: {
  dropoffIso: string | null
  store: BookingStore
  gap: number
  today: string
}) {
  const form = useBookingFormContext()
  const { returnDate: date, returnHour: hour } = form.values
  const slots = dropoffIso ? returnSlots(dropoffIso, store.openingTime, store.closingTime, gap) : []
  const hours = slots.find((s) => s.date === date)?.hours ?? []

  if (!dropoffIso) return null
  if (slots.length === 0) {
    return (
      <Alert color="orange" title="Giờ nhận lại">
        Không còn giờ nhận lại phù hợp. Vui lòng gọi tiệm để được hỗ trợ.
      </Alert>
    )
  }
  return (
    <Input.Wrapper labelElement="div" error={form.errors.returnHour}>
      <div role="group" aria-label="Giờ nhận lại: ngày" className="flex flex-wrap gap-3">
        {slots.map((s) => (
          <DateCard
            key={s.date}
            date={s.date}
            today={today}
            selected={date === s.date}
            onPick={() => {
              form.setFieldValue('returnDate', s.date)
              form.setFieldValue('returnHour', null)
            }}
          />
        ))}
      </div>
      {date && (
        <div role="group" aria-label="Giờ nhận lại: giờ" className={`mt-6 ${HOURS_GRID}`}>
          <HourChips hours={hours} selected={hour} onPick={(h) => form.setFieldValue('returnHour', h)} />
        </div>
      )}
    </Input.Wrapper>
  )
}

export function StepTime({ store, settings }: Props) {
  const form = useBookingFormContext()
  const { appointmentDate, appointmentHour, dropoffMethod, orderType } = form.values
  const { minLeadHours } = settings
  const gap = gapHoursOf(settings, orderType)
  const dropoffIso =
    appointmentDate !== null && appointmentHour !== null
      ? toAppointmentIso(appointmentDate, appointmentHour)
      : null
  const dropoffLabel = dropoffMethod === 'AT_STORE' ? 'Giờ mang đến tiệm' : 'Giờ tiệm đến lấy'
  const [now] = useState(Date.now) // mốc lúc mở bước; BE kiểm lại khi gửi
  const today = vnToday(now)
  const slots = appointmentSlots(now, store.openingTime, store.closingTime, minLeadHours)
  const hours = slots.find((s) => s.date === appointmentDate)?.hours ?? []

  const pickDate = (d: string) => {
    form.setFieldValue('appointmentDate', d)
    form.setFieldValue('appointmentHour', null)
  }

  const pickupCard = (
    <TimeCard
      icon={<LuPackagePlus size={20} />}
      title={dropoffLabel}
      tip={`Giờ hẹn nằm trong giờ mở cửa ${store.openingTime} – ${store.closingTime}, sau thời điểm đặt ít nhất ${minLeadHours} giờ và chỉ trong hôm nay hoặc ngày mai.`}
    >
      <Input.Wrapper error={form.errors.appointmentDate}>
        <div role="group" aria-label={`${dropoffLabel}: ngày`} className="flex flex-wrap gap-3">
          {slots.map((s) => (
            <DateCard
              key={s.date}
              date={s.date}
              today={today}
              selected={appointmentDate === s.date}
              onPick={() => pickDate(s.date)}
            />
          ))}
        </div>
      </Input.Wrapper>
      {appointmentDate && (
        <Input.Wrapper error={form.errors.appointmentHour}>
          <div role="group" aria-label={`${dropoffLabel}: giờ`} className={HOURS_GRID}>
            <HourChips
              hours={hours}
              selected={appointmentHour}
              onPick={(h) => form.setFieldValue('appointmentHour', h)}
            />
          </div>
        </Input.Wrapper>
      )}
    </TimeCard>
  )

  const returnCard = (
    <TimeCard
      icon={<LuPackageCheck size={20} />}
      title="Giờ nhận lại"
      tip={returnTip(store, gap)}
    >
      <p className="text-(length:--pub-text-sm) text-(--pub-ink-muted)">
        Sớm nhất {gap} giờ sau giờ gửi ({TIER_LABEL[orderType]})
      </p>
      <ReturnBlock dropoffIso={dropoffIso} store={store} gap={gap} today={today} />
    </TimeCard>
  )

  return (
    <Stack gap={24}>
      {slots.length === 0 ? (
        <Alert color="orange" title="Hôm nay và ngày mai đã hết giờ hẹn">
          Vui lòng quay lại sau hoặc gọi tiệm để được hỗ trợ.
        </Alert>
      ) : (
        <>
          {pickupCard}
          {returnCard}
        </>
      )}
      <Alert color="blue" title="Tiệm sẽ gọi điện hoặc nhắn Zalo để xác nhận.">
        Giờ hẹn có thể được điều chỉnh theo thỏa thuận với anh/chị.
      </Alert>
    </Stack>
  )
}
