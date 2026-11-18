import { usePublicServiceAreas } from '../application/queries/usePublicServiceAreas'
import { SectionHeading } from './SectionHeading'

// [ảnh, tiêu đề, mô tả]; ảnh là ảnh thay thế có giấy phép, thay bằng ảnh chụp chính tiệm khi có
type Step = [string, string, string]

const PHOTO_ALT: Record<string, string> = {
  '/landing/buoc-1-gio-do.jpg': 'Giỏ nhựa đựng quần áo cần giặt',
  '/landing/buoc-2-do-gap.jpg': 'Chồng áo đã gấp gọn',
  '/landing/buoc-3-long-giat.jpg': 'Lồng giặt inox nhìn từ bên trong',
  '/landing/buoc-4-khan-sach.jpg': 'Những chồng khăn sạch đã gấp',
}

const DROP_OFF: Step = [
  '/landing/buoc-1-gio-do.jpg',
  'Mang đồ đến tiệm',
  'Ghé tiệm trong giờ mở cửa, tiệm nhận đồ ngay tại quầy.',
]
const DROP_OFF_OR_PICKUP: Step = [
  '/landing/buoc-1-gio-do.jpg',
  'Mang đồ đến hoặc nhờ lấy tận nơi',
  'Ghé tiệm trong giờ mở cửa, hoặc gọi để tiệm qua lấy nếu bạn ở trong khu vực phục vụ.',
]
const RECEIVE: Step = [
  '/landing/buoc-4-khan-sach.jpg',
  'Nhận đồ và thanh toán',
  'Qua tiệm nhận đồ, kiểm tra rồi thanh toán.',
]
const RECEIVE_OR_DELIVERY: Step = [
  '/landing/buoc-4-khan-sach.jpg',
  'Nhận đồ và thanh toán',
  'Qua tiệm nhận hoặc nhận tận nơi, kiểm tra đồ rồi thanh toán.',
]
const MIDDLE_STEPS: Step[] = [
  [
    '/landing/buoc-2-do-gap.jpg',
    'Tiệm cân, đếm và ghi biên nhận',
    'Đồ được cân hoặc đếm ngay khi nhận, kèm biên nhận ghi rõ dịch vụ, giá và ngày hẹn trả.',
  ],
  [
    '/landing/buoc-3-long-giat.jpg',
    'Giặt xong, tiệm báo bạn',
    'Đồ được giặt, sấy, gấp gọn. Xong là tiệm báo để bạn sắp xếp.',
  ],
]

/** Cách hoạt động: quy trình tại tiệm; bước lấy, giao tận nơi chỉ hiện khi có khu vực phục vụ. */
export function HowItWorks() {
  // Chỉ nhắc lấy, giao tận nơi khi tiệm có khu vực phục vụ
  const door = !!usePublicServiceAreas().data?.length
  const steps = door
    ? [DROP_OFF_OR_PICKUP, ...MIDDLE_STEPS, RECEIVE_OR_DELIVERY]
    : [DROP_OFF, ...MIDDLE_STEPS, RECEIVE]

  return (
    <section
      id="cach-hoat-dong"
      aria-labelledby="cach-hoat-dong-title"
      className="pub-section bg-(--pub-surface)"
    >
      <div className="pub-container">
        <SectionHeading
          id="cach-hoat-dong-title"
          eyebrow="Đơn giản"
          title={
            <>
              Cách <span className="pub-accent-word">hoạt động</span>
            </>
          }
        >
          Bốn bước quen thuộc, không cần cài ứng dụng hay tạo tài khoản.
        </SectionHeading>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([photo, title, desc], i) => (
            <li
              key={title}
              className="pub-card pub-card--lift flex flex-col gap-3 bg-(--pub-surface-alt)! p-3 pb-6"
            >
              <div className="relative mb-4">
                <div className="pub-photo aspect-[4/3] rounded-(--pub-radius-md)">
                  <img
                    src={photo}
                    alt={PHOTO_ALT[photo]}
                    width={640}
                    height={480}
                    loading="lazy"
                    data-source="stand-in"
                    data-subject={title}
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute right-4 -bottom-5 grid size-11 place-items-center rounded-full border-4 border-(--pub-surface-alt) bg-(--pub-accent) font-semibold text-(--pub-on-accent) tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="px-2 text-(length:--pub-text-lg) font-semibold">{title}</h3>
              <p className="px-2 text-(--pub-ink-muted)">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
