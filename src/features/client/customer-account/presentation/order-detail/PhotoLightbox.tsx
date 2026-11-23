import { Modal } from '@mantine/core'
import { useState } from 'react'

interface Props {
  title: string
  images: { url: string }[]
  /** Index đang mở; null = đóng. */
  index: number | null
  onClose: () => void
}

export function PhotoLightbox({ title, images, index, onClose }: Props) {
  const [moved, setMoved] = useState<number | null>(null)
  const i = moved ?? index ?? 0
  const n = images.length
  const step = (d: number) => setMoved((i + d + n) % n)
  const img = images[i]
  return (
    <Modal
      opened={index !== null && !!img}
      onClose={() => {
        setMoved(null)
        onClose()
      }}
      title={`${title} · ảnh ${i + 1}/${n}`}
      centered
      size="lg"
      closeOnEscape
      onKeyDown={(e) => {
        if (n < 2) return
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
    >
      {img && (
        <div data-surface="public" data-surface-bg="none" className="flex items-center gap-2">
          {n > 1 && (
            <button
              type="button"
              className="pub-btn pub-btn--ghost"
              aria-label="Ảnh trước"
              onClick={() => step(-1)}
            >
              ‹
            </button>
          )}
          <img
            src={img.url}
            alt={`Ảnh tiệm chụp: ${title} ${i + 1}`}
            className="max-h-[70vh] min-w-0 flex-1 rounded-(--pub-radius-lg) object-contain"
          />
          {n > 1 && (
            <button
              type="button"
              className="pub-btn pub-btn--ghost"
              aria-label="Ảnh sau"
              onClick={() => step(1)}
            >
              ›
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}
