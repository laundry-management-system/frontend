import type { ReactNode } from 'react'

interface SectionHeadingProps {
  id: string
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
}

/** Tiêu đề h2 của một section; `tabIndex=-1` để menu neo chuyển focus vào đây sau khi cuộn tới. */
export function SectionHeading({ id, eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="pub-section-head">
      {eyebrow && (
        <p className="pub-eyebrow" aria-hidden="true">
          {eyebrow}
        </p>
      )}
      <h2 id={id} tabIndex={-1} className="pub-h2">
        {title}
      </h2>
      {children && <p className="pub-lead">{children}</p>}
    </div>
  )
}
