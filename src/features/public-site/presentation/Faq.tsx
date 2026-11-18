import { Accordion } from '@mantine/core'
import { compensationTermsText } from '@/shared/lib/compensationTerms'
import { usePublicServiceAreas } from '../application/queries/usePublicServiceAreas'
import { usePublicStore } from '../application/queries/usePublicStore'
import { SectionHeading } from './SectionHeading'

const FIRST = 'gia'
const TITLE = (
  <>
    Câu hỏi <span className="pub-accent-word">thường gặp</span>
  </>
)
const ACCORDION_CLASSES = {
  item: 'pub-card overflow-hidden border-(--pub-border)! bg-(--pub-bg)! data-active:bg-(--pub-surface)!',
  control: 'min-h-14 font-semibold!',
  label:
    'font-(family-name:--pub-font-display)! text-(length:--pub-text-lg)! text-(--pub-ink) whitespace-normal',
  content: 'text-(--pub-ink-muted)',
}

/** Câu hỏi thường gặp; câu nào cần số liệu cửa hàng thì chỉ hiện khi đã có số liệu. */
export function Faq() {
  const { data } = usePublicStore()
  const door = !!usePublicServiceAreas().data?.length

  const items: [value: string, q: string, a: string | null][] = [
    [
      FIRST,
      'Giá trên bảng giá đã là số tiền cuối cùng chưa?',
      'Bảng giá là đơn giá hiện hành của tiệm. Số tiền chính thức được tính khi tiệm cân hoặc đếm đồ lúc nhận và ghi trên biên nhận.',
    ],
    [
      'gio',
      'Tiệm mở cửa lúc nào?',
      data ? `Tiệm mở cửa từ ${data.openingTime} đến ${data.closingTime} tất cả các ngày.` : null,
    ],
    [
      'tan-noi',
      'Tiệm có lấy và giao đồ tận nơi không?',
      door
        ? 'Có, nếu bạn ở trong khu vực phục vụ. Phí lấy và giao xem ở phần Khu vực phục vụ, hoặc gọi tiệm để hỏi thêm.'
        : null,
    ],
    [
      'boi-thuong',
      'Nếu đồ bị hư hỏng hoặc thất lạc thì sao?',
      data
        ? `${compensationTermsText(data.compensationMultiplier, data.compensationCapPerItem)}.`
        : null,
    ],
    [
      'luu-do',
      'Giặt xong bao lâu thì tôi phải qua lấy?',
      data
        ? `Tiệm giữ đồ giặt xong tối đa ${data.storageDays} ngày kể từ ngày hẹn trả. Bạn nên qua lấy sớm để đồ luôn thơm.`
        : null,
    ],
  ]

  return (
    <section
      id="hoi-dap"
      aria-labelledby="hoi-dap-title"
      className="pub-section bg-(--pub-surface)"
    >
      <div className="pub-container grid gap-x-20 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading id="hoi-dap-title" eyebrow="Hỏi đáp" title={TITLE} />
        <Accordion
          defaultValue={FIRST}
          variant="separated"
          radius="var(--pub-radius-lg)"
          order={3}
          classNames={ACCORDION_CLASSES}
        >
          {items
            .filter(([, , a]) => a !== null)
            .map(([value, q, a]) => (
              <Accordion.Item key={value} value={value}>
                <Accordion.Control>{q}</Accordion.Control>
                <Accordion.Panel>{a}</Accordion.Panel>
              </Accordion.Item>
            ))}
        </Accordion>
      </div>
    </section>
  )
}
