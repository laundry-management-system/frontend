import { Skeleton } from '@mantine/core'
import type { IconType } from 'react-icons'
import { LuArchive, LuReceiptText, LuShieldCheck } from 'react-icons/lu'
import { compensationTermsText } from '@/shared/common/lib/compensationTerms'
import { usePublicStore } from '../application/queries/usePublicStore'
import { SectionHeading } from './SectionHeading'

interface Commitment {
  icon: IconType
  title: string
  /** `null`: đang tải; `undefined`: lỗi tải nên bỏ cả thẻ (thẻ này cần số liệu). */
  text: string | null | undefined
}

/** Cam kết của tiệm; số liệu bồi thường và lưu đồ lấy từ cài đặt hiện hành. */
export function Commitments() {
  const { data, isPending } = usePublicStore()
  const numeric = (fn: (d: NonNullable<typeof data>) => string) =>
    isPending ? null : data ? fn(data) : undefined

  const items: Commitment[] = [
    {
      icon: LuReceiptText,
      title: 'Cân, đếm minh bạch',
      text: 'Đồ được cân hoặc đếm khi nhận, có biên nhận ghi rõ dịch vụ, số lượng và giá.',
    },
    {
      icon: LuShieldCheck,
      title: 'Bồi thường rõ ràng',
      text: numeric(
        (d) => `${compensationTermsText(d.compensationMultiplier, d.compensationCapPerItem)}.`,
      ),
    },
    {
      icon: LuArchive,
      title: 'Giữ đồ giúp bạn',
      text: numeric(
        (d) => `Đồ giặt xong được tiệm giữ tối đa ${d.storageDays} ngày kể từ ngày hẹn trả.`,
      ),
    },
  ]

  const photo = (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-4 translate-y-4 rounded-(--pub-radius-xl) bg-(--pub-orchid) sm:translate-x-6 sm:translate-y-6"
      />
      {/* shortcut: ảnh thay thế có giấy phép (Wikimedia Commons), thay bằng ảnh chụp chính tiệm khi có */}
      <div className="pub-photo relative aspect-[4/5] rounded-(--pub-radius-xl)">
        <img
          src="/landing/cam-ket-phoi-do.jpg"
          alt="Quần áo sạch phơi thẳng trên giá"
          width={820}
          height={673}
          loading="lazy"
          data-source="stand-in"
          data-subject="quần áo phơi trên giá"
        />
      </div>
    </div>
  )

  return (
    <section id="cam-ket" aria-labelledby="cam-ket-title" className="pub-section">
      <div className="pub-container grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        {photo}
        <div>
          <SectionHeading
            id="cam-ket-title"
            eyebrow="Yên tâm"
            title={
              <>
                Cam kết <span className="pub-accent-word">của tiệm</span>
              </>
            }
          />
          <ul className="flex flex-col gap-4">
            {items
              .filter((c) => c.text !== undefined)
              .map((c) => (
                <li
                  key={c.title}
                  className="flex items-start gap-4 rounded-(--pub-radius-lg) border border-(--pub-border) bg-(--pub-surface) p-5"
                >
                  <span className="pub-icon-tile" aria-hidden="true">
                    <c.icon size={22} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="text-(length:--pub-text-lg) font-semibold">{c.title}</h3>
                    {c.text === null ? (
                      <div aria-hidden="true">
                        <Skeleton h={14} w="100%" />
                        <Skeleton h={14} w="70%" mt={8} />
                      </div>
                    ) : (
                      <p className="text-(--pub-ink-muted)">{c.text}</p>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
