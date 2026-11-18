import type { ReactNode } from 'react'

export interface AuthPhoto {
  src: string
  alt: string
}

interface AuthShellProps {
  eyebrow: string
  title: string
  lead: string
  photo: AuthPhoto
  children: ReactNode
}

/** Khung chung cho đăng nhập, đăng ký, quên và đặt lại mật khẩu: thẻ form bên trái, ảnh tiệm bên phải. */
export function AuthShell({ eyebrow, title, lead, photo, children }: AuthShellProps) {
  return (
    <section className="pub-container py-10 md:py-16">
      <div className="grid items-stretch gap-8 md:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-14">
        <div className="pub-auth-card" data-enter>
          <span className="pub-eyebrow">{eyebrow}</span>
          <h1 className="mt-3 text-(length:--pub-text-2xl) leading-(--pub-leading-tight)">
            {title}
          </h1>
          <p className="mt-3 mb-8 text-(length:--pub-text-md) text-(--pub-ink-muted)">{lead}</p>
          {children}
        </div>
        <figure className="pub-auth-photo">
          <img src={photo.src} alt={photo.alt} loading="eager" decoding="async" />
        </figure>
      </div>
    </section>
  )
}
