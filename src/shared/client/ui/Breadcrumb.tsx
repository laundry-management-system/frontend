import { Fragment, type ReactNode } from 'react'
import { LuChevronRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: ReactNode
  to?: string
}

/** Đường dẫn phân cấp cho trang client; mục cuối (không có `to`) là trang hiện tại. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-(length:--pub-text-md) text-(--pub-ink-muted)">
        {items.map((it, i) => (
          <Fragment key={i}>
            {i > 0 && <LuChevronRight size={14} aria-hidden="true" />}
            <li>
              {it.to ? (
                <Link to={it.to} className="underline-offset-2 hover:text-(--pub-ink) hover:underline">
                  {it.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-(--pub-ink)">
                  {it.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
