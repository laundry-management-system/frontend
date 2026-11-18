/** Ảnh mở đầu trong khung vòm, phía sau là vòm tím phong lan, viền mảnh và vài nét trang trí như bản mẫu. */
export function HeroPhoto() {
  return (
    <div className="pub-rise pub-rise--late relative mx-auto w-full max-w-[19rem] sm:max-w-[24rem] md:max-w-[28rem]">
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-4 translate-y-4 rounded-t-full rounded-b-(--pub-radius-lg) bg-(--pub-orchid) sm:-translate-x-6 sm:translate-y-6"
      />
      <span
        aria-hidden="true"
        className="absolute -inset-3 rounded-t-full rounded-b-(--pub-radius-lg) border border-(--pub-ink)/60 sm:-inset-4"
      />
      {/* shortcut: ảnh thay thế có giấy phép (Wikimedia Commons), thay bằng ảnh chụp chính tiệm khi có */}
      <div className="pub-photo relative aspect-[4/5] rounded-t-full rounded-b-(--pub-radius-lg)">
        <img
          src="/landing/hero-tiem-giat.jpg"
          alt="Dãy máy giặt cửa trước trong một tiệm giặt"
          width={730}
          height={720}
          fetchPriority="high"
          data-source="stand-in"
          data-subject="máy giặt trong tiệm giặt"
        />
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="absolute top-[14%] -left-5 size-9 text-(--pub-accent) sm:-left-8 sm:size-11"
      >
        <path
          d="M20 0c1.6 10.4 9.6 18.4 20 20-10.4 1.6-18.4 9.6-20 20-1.6-10.4-9.6-18.4-20-20C10.4 18.4 18.4 10.4 20 0z"
          fill="currentColor"
          stroke="#01082a"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 80 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="absolute top-[18%] -right-3 w-16 text-(--pub-ink) sm:-right-6 sm:w-20"
      >
        <path d="M4 8q6-6 12 0t12 0 12 0 12 0 12 0 12 0" />
        <path d="M4 20q6-6 12 0t12 0 12 0 12 0 12 0 12 0" />
        <path d="M4 32q6-6 12 0t12 0 12 0 12 0 12 0 12 0" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 60 70"
        className="absolute bottom-[8%] -left-8 w-12 text-(--pub-dot) sm:-left-12 sm:w-14"
      >
        <g fill="currentColor">
          <ellipse cx="38" cy="6" rx="5" ry="6" />
          <ellipse cx="10" cy="18" rx="6" ry="5" />
          <ellipse cx="30" cy="24" rx="4" ry="5" />
          <ellipse cx="52" cy="30" rx="4" ry="6" />
          <ellipse cx="14" cy="42" rx="5" ry="4" />
          <ellipse cx="36" cy="48" rx="4" ry="5" />
          <ellipse cx="22" cy="64" rx="5" ry="5" />
          <ellipse cx="50" cy="60" rx="4" ry="5" />
        </g>
      </svg>
    </div>
  )
}
