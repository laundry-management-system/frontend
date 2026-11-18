/** Bản đồ minh hoạ: tiệm ở giữa, vòng phục vụ và tuyến giao tới nhà khách. Không theo toạ độ thật. */
export function RouteMap() {
  return (
    <div className="pub-map h-52 sm:h-60" aria-hidden="true">
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="size-full">
        <g className="fill-none stroke-(--pub-surface)" strokeLinecap="round">
          <path d="M-10 70 C 120 60, 220 110, 410 90" strokeWidth="12" />
          <path d="M150 -10 C 160 90, 120 170, 140 250" strokeWidth="10" />
          <path d="M260 -10 L 300 250" strokeWidth="8" />
          <path d="M-10 190 C 100 200, 250 160, 410 200" strokeWidth="6" />
        </g>
        <g className="fill-none stroke-(--pub-accent)">
          <circle cx="150" cy="120" r="46" strokeWidth="1.5" opacity="0.5" />
          <circle cx="150" cy="120" r="88" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 6" />
        </g>
        <path
          d="M150 120 C 200 120, 220 70, 300 72"
          className="fill-none stroke-(--pub-orchid)"
          strokeWidth="3"
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
        <g transform="translate(300 72)">
          <circle r="14" className="fill-(--pub-orchid)" opacity="0.2" />
          <circle r="6" className="fill-(--pub-orchid) stroke-(--pub-surface)" strokeWidth="2.5" />
        </g>
        <g transform="translate(150 120)">
          <circle r="22" className="fill-(--pub-accent)" opacity="0.25" />
          <path
            d="M0 10 C -10 0, -13 -6, -13 -12 A 13 13 0 0 1 13 -12 C 13 -6, 10 0, 0 10 Z"
            className="fill-(--pub-primary)"
            transform="translate(0 -6)"
          />
          <circle cy="-18" r="4.5" className="fill-(--pub-accent)" />
        </g>
      </svg>
    </div>
  )
}
