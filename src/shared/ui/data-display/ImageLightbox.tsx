import { Group, Image, Modal, Stack } from '@mantine/core'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { IconButton } from '../buttons/IconButton'

export interface LightboxImage {
  imageUrl: string
}

/** Xem ảnh lớn; `index` null là đóng. Đi quá ảnh đầu / cuối thì xoay vòng. */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  title = 'Ảnh tình trạng',
}: {
  images: LightboxImage[]
  index: number | null
  onIndexChange: (index: number | null) => void
  title?: string
}) {
  const current = index !== null ? images[index] : undefined
  const close = () => onIndexChange(null)
  const step = (delta: number) =>
    index !== null && onIndexChange((index + delta + images.length) % images.length)
  const showPrev = () => step(-1)
  const showNext = () => step(1)
  const heading =
    index !== null && images.length > 1 ? `${title} ${index + 1}/${images.length}` : title

  return (
    <Modal opened={!!current} onClose={close} size="lg" title={heading}>
      {current && (
        <Stack gap="sm">
          <Image src={current.imageUrl} alt={title} radius="sm" />
          {images.length > 1 && (
            <Group justify="space-between">
              <IconButton label="Ảnh trước" icon={<LuChevronLeft size={18} />} onClick={showPrev} />
              <IconButton label="Ảnh sau" icon={<LuChevronRight size={18} />} onClick={showNext} />
            </Group>
          )}
        </Stack>
      )}
    </Modal>
  )
}
