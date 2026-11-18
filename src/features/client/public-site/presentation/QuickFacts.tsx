import { Skeleton } from '@mantine/core'
import { useState } from 'react'
import type { IconType } from 'react-icons'
import { LuClock, LuPause, LuPlay, LuSparkle, LuTag, LuTimer } from 'react-icons/lu'
import { UNIT_LABEL } from '../domain/types'
import { formatMoney } from '@/shared/common/lib/format'
import { usePublicServices } from '../application/queries/usePublicServices'
import { usePublicStore } from '../application/queries/usePublicStore'

interface Fact {
  icon: IconType
  label: string
  value: string
}

const SKELETON_FACTS = [0, 1, 2]
const PROMISE_WORDS = ['Cân, đếm rõ ràng', 'Biên nhận ghi rõ giá', 'Giặt xong báo ngay']

/** Dải chữ chạy: tên các dịch vụ đang có và lời hứa của tiệm; có nút tạm dừng vì chạy quá 5 giây. */
function WordBand({ words }: { words: string[] }) {
  const [paused, setPaused] = useState(false)
  const togglePaused = () => setPaused((p) => !p)
  // Mỗi nửa dải phải dài hơn màn hình rộng thì vòng lặp mới liền
  const half = words.length < 8 ? [...words, ...words] : words
  // Hai bản giống nhau nối đuôi: chạy hết bản đầu thì quay về 0 mà không thấy giật
  const loop = [...half, ...half]
  const items = loop.map((w, i) => (
    <li key={i} className="flex items-center gap-6 pr-6">
      <LuSparkle size={22} className="flex-none text-(--pub-accent)" />
      <span className="whitespace-nowrap">{w}</span>
    </li>
  ))
  return (
    <div className="flex items-center">
      <div className="min-w-0 flex-1 overflow-hidden py-6" aria-hidden="true">
        <ul
          className="pub-marquee font-(family-name:--pub-font-display) text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] leading-none font-semibold"
          data-paused={paused ? '' : undefined}
        >
          {items}
        </ul>
      </div>
      <button
        type="button"
        onClick={togglePaused}
        aria-pressed={paused}
        aria-label={paused ? 'Chạy dải chữ' : 'Tạm dừng dải chữ'}
        className="mx-3 grid size-11 flex-none place-items-center rounded-(--pub-radius-btn) border border-white/30 text-white transition-colors duration-(--pub-duration) hover:bg-white/10"
      >
        {paused ? (
          <LuPlay size={16} aria-hidden="true" />
        ) : (
          <LuPause size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

/** Dải thông tin nhanh: chỉ số liệu là quy định hiện hành của tiệm; thiếu dữ liệu thì bỏ ô đó. */
export function QuickFacts() {
  const store = usePublicStore()
  const services = usePublicServices()
  const list = services.data ?? []

  const facts: Fact[] = []
  if (store.data)
    facts.push({
      icon: LuClock,
      label: 'Mở cửa mỗi ngày',
      value: `${store.data.openingTime} – ${store.data.closingTime}`,
    })
  if (list.length > 0) {
    const fastest = Math.min(...list.map((s) => s.standardHours))
    const cheapest = list.reduce((a, b) => (b.price < a.price ? b : a))
    facts.push({ icon: LuTimer, label: 'Xử lý chuẩn nhanh nhất', value: `${fastest} giờ` })
    facts.push({
      icon: LuTag,
      label: 'Giá dịch vụ',
      value: `từ ${formatMoney(cheapest.price)}/${UNIT_LABEL[cheapest.unit]}`,
    })
  }
  const words = [...new Set([...list.map((s) => s.name), ...PROMISE_WORDS])]

  const loading = store.isPending || services.isPending
  const factList =
    !loading && facts.length === 0 ? null : (
      <dl className="pub-container grid gap-8 py-10 sm:grid-cols-3 sm:gap-0 sm:py-12">
        {loading
          ? SKELETON_FACTS.map((i) => (
              <div key={i} className="flex flex-col gap-3 sm:px-8 sm:first:pl-0" aria-hidden="true">
                <Skeleton h={36} w="70%" className="opacity-20" />
                <Skeleton h={14} w="50%" className="opacity-20" />
              </div>
            ))
          : facts.map((f) => (
              <div
                key={f.label}
                className="flex flex-col-reverse gap-2 sm:border-l sm:border-white/15 sm:px-8 sm:first:border-l-0 sm:first:pl-0"
              >
                <dt className="flex items-center gap-2 text-white/80">
                  <f.icon size={18} className="flex-none text-(--pub-accent)" aria-hidden="true" />
                  {f.label}
                </dt>
                <dd className="font-(family-name:--pub-font-display) text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-tight font-semibold tabular-nums">
                  {f.value}
                </dd>
              </div>
            ))}
      </dl>
    )

  return (
    <section
      aria-labelledby="thong-tin-nhanh-title"
      className="pub-on-dark bg-(--pub-primary) text-(--pub-on-primary)"
    >
      <h2 id="thong-tin-nhanh-title" className="sr-only">
        Thông tin nhanh
      </h2>
      <WordBand words={words} />
      {factList}
    </section>
  )
}
