// Vercel Routing Middleware: chèn thẻ SEO/OG thật vào HTML ban đầu cho crawler (FR-043, research R3)
export const config = { matcher: ['/', '/about'] }

interface PublicStore {
  name: string
  address: string | null
  phone: string | null
  openingTime: string
  closingTime: string
}

const STORE_TIMEOUT_MS = 800

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c])

const formatPhone = (p: string) =>
  /^\d{10}$/.test(p) ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p

function metaTags(store: PublicStore, origin: string): { title: string; head: string } {
  const description = [
    `${store.name}.`,
    store.address && `${store.address}.`,
    store.phone && `Gọi ${formatPhone(store.phone)}.`,
    store.openingTime &&
      store.closingTime &&
      `Mở cửa ${store.openingTime}–${store.closingTime} mỗi ngày.`,
  ]
    .filter(Boolean)
    .join(' ')
  const name = escapeHtml(store.name)
  const desc = escapeHtml(description)
  const url = escapeHtml(`${origin}/`)
  return {
    title: `<title>${name} – Giặt sấy, giặt ủi</title>`,
    head: [
      `<meta name="description" content="${desc}" />`,
      '<meta name="robots" content="index,follow" />',
      `<link rel="canonical" href="${url}" />`,
      '<meta property="og:type" content="website" />',
      '<meta property="og:locale" content="vi_VN" />',
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:title" content="${name}" />`,
      `<meta property="og:description" content="${desc}" />`,
    ].join('\n    '),
  }
}

async function fetchStore(request: Request): Promise<PublicStore | null> {
  try {
    const res = await fetch(new URL('/api/public/store', request.url), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const store = (await res.json()) as PublicStore
    return typeof store?.name === 'string' && store.name ? store : null
  } catch {
    // Backend ngủ (cold start), lỗi mạng hoặc quá 800 ms: trả HTML gốc
    return null
  }
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  // Không phải GET thì để Vercel xử lý như bình thường
  if (request.method !== 'GET') return undefined

  // /index.html không khớp matcher nên không gọi lại middleware
  const [shellRes, store] = await Promise.all([
    fetch(new URL('/index.html', request.url)),
    fetchStore(request),
  ])
  if (!shellRes.ok) return undefined
  let html = await shellRes.text()

  if (store) {
    const { title, head } = metaTags(store, new URL(request.url).origin)
    html = html.replace(/<title>[\s\S]*?<\/title>/, () => title).replace(
      '</head>',
      () => `  ${head}\n  </head>`,
    )
  }

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}
