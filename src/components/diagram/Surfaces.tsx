export function FieldSurface({ goalStyle }: { goalStyle: "box" | "d-circle" | "crease" }) {
  return (
    <g>
      <rect x="0" y="0" width="100" height="60" fill="#4c9a5c" />
      <rect x="2" y="2" width="96" height="56" fill="none" stroke="white" strokeWidth="0.6" />
      <line x1="50" y1="2" x2="50" y2="58" stroke="white" strokeWidth="0.5" />
      <circle cx="50" cy="30" r="8" fill="none" stroke="white" strokeWidth="0.5" />
      {goalStyle === "box" && (
        <>
          <rect x="2" y="18" width="12" height="24" fill="none" stroke="white" strokeWidth="0.5" />
          <rect x="86" y="18" width="12" height="24" fill="none" stroke="white" strokeWidth="0.5" />
          <rect x="0" y="25" width="2" height="10" fill="white" />
          <rect x="98" y="25" width="2" height="10" fill="white" />
        </>
      )}
      {goalStyle === "d-circle" && (
        <>
          <path d="M2,20 Q16,30 2,40" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M98,20 Q84,30 98,40" fill="none" stroke="white" strokeWidth="0.5" />
          <rect x="0" y="27" width="2" height="6" fill="white" />
          <rect x="98" y="27" width="2" height="6" fill="white" />
        </>
      )}
      {goalStyle === "crease" && (
        <>
          <circle cx="6" cy="30" r="7" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="94" cy="30" r="7" fill="none" stroke="white" strokeWidth="0.5" />
          <rect x="0" y="27" width="2" height="6" fill="white" />
          <rect x="98" y="27" width="2" height="6" fill="white" />
        </>
      )}
    </g>
  );
}

export function FootballFieldSurface() {
  const yardLines = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  return (
    <g>
      <rect x="0" y="0" width="100" height="60" fill="#4c9a5c" />
      <rect x="0" y="0" width="8" height="60" fill="#3f8250" />
      <rect x="92" y="0" width="8" height="60" fill="#3f8250" />
      {yardLines.map((x) => (
        <line key={x} x1={x} y1="2" x2={x} y2="58" stroke="white" strokeOpacity="0.75" strokeWidth="0.35" />
      ))}
      <line x1="50" y1="2" x2="50" y2="58" stroke="white" strokeWidth="0.6" />
      <rect x="2" y="2" width="96" height="56" fill="none" stroke="white" strokeWidth="0.6" />
    </g>
  );
}

export function CourtSurface({ variant }: { variant: "basketball" | "tennis" | "volleyball" }) {
  if (variant === "tennis") {
    return (
      <g>
        <rect x="0" y="0" width="100" height="60" fill="#2d6ca8" />
        <rect x="4" y="6" width="92" height="48" fill="none" stroke="white" strokeWidth="0.6" />
        <line x1="50" y1="6" x2="50" y2="54" stroke="white" strokeWidth="0.8" strokeDasharray="1.4,1" />
        <rect x="26" y="6" width="48" height="48" fill="none" stroke="white" strokeWidth="0.4" />
        <line x1="26" y1="30" x2="74" y2="30" stroke="white" strokeWidth="0.4" />
      </g>
    );
  }
  if (variant === "volleyball") {
    return (
      <g>
        <rect x="0" y="0" width="100" height="60" fill="#d8b47c" />
        <rect x="4" y="4" width="92" height="52" fill="none" stroke="white" strokeWidth="0.6" />
        <line x1="50" y1="4" x2="50" y2="56" stroke="white" strokeWidth="1" />
        <line x1="33" y1="4" x2="33" y2="56" stroke="white" strokeWidth="0.35" strokeDasharray="1.2,1" />
        <line x1="67" y1="4" x2="67" y2="56" stroke="white" strokeWidth="0.35" strokeDasharray="1.2,1" />
      </g>
    );
  }
  return (
    <g>
      <rect x="0" y="0" width="100" height="60" fill="#dcbb8a" />
      <rect x="3" y="3" width="94" height="54" fill="none" stroke="white" strokeWidth="0.6" />
      <line x1="50" y1="3" x2="50" y2="57" stroke="white" strokeWidth="0.4" />
      <circle cx="50" cy="30" r="7" fill="none" stroke="white" strokeWidth="0.4" />
      <rect x="3" y="20" width="14" height="20" fill="none" stroke="white" strokeWidth="0.4" />
      <rect x="83" y="20" width="14" height="20" fill="none" stroke="white" strokeWidth="0.4" />
      <path d="M3,10 Q26,30 3,50" fill="none" stroke="white" strokeWidth="0.4" />
      <path d="M97,10 Q74,30 97,50" fill="none" stroke="white" strokeWidth="0.4" />
    </g>
  );
}

export function DiamondSurface() {
  return (
    <g>
      <rect x="0" y="0" width="100" height="60" fill="#4c9a5c" />
      <path d="M50,54 L18,30 A45,45 0 0 1 82,30 Z" fill="#3f8250" />
      <path d="M50,54 L26,34 L50,14 L74,34 Z" fill="#c58b56" stroke="white" strokeWidth="0.4" />
      <rect x="48.3" y="52.3" width="3.4" height="3.4" fill="white" transform="rotate(45 50 54)" />
      <rect x="24.3" y="32.3" width="3.4" height="3.4" fill="white" transform="rotate(45 26 34)" />
      <rect x="48.3" y="12.3" width="3.4" height="3.4" fill="white" transform="rotate(45 50 14)" />
      <rect x="72.3" y="32.3" width="3.4" height="3.4" fill="white" transform="rotate(45 74 34)" />
      <circle cx="50" cy="38" r="1.4" fill="#8a5a34" stroke="white" strokeWidth="0.3" />
    </g>
  );
}

export function RinkSurface() {
  return (
    <g>
      <rect x="0" y="0" width="100" height="60" rx="14" fill="#cfe8f7" />
      <rect x="1.5" y="1.5" width="97" height="57" rx="13" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
      <line x1="33" y1="1.5" x2="33" y2="58.5" stroke="#2563eb" strokeWidth="0.8" />
      <line x1="67" y1="1.5" x2="67" y2="58.5" stroke="#2563eb" strokeWidth="0.8" />
      <line x1="50" y1="1.5" x2="50" y2="58.5" stroke="#e11d48" strokeWidth="0.8" />
      <circle cx="50" cy="30" r="7" fill="none" stroke="#2563eb" strokeWidth="0.4" />
      {[
        [16, 12],
        [16, 48],
        [84, 12],
        [84, 48],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="none" stroke="#e11d48" strokeWidth="0.35" />
      ))}
      <path d="M2,25 Q7,30 2,35" fill="none" stroke="#e11d48" strokeWidth="0.5" />
      <path d="M98,25 Q93,30 98,35" fill="none" stroke="#e11d48" strokeWidth="0.5" />
      <rect x="0" y="27" width="1.6" height="6" fill="#e11d48" />
      <rect x="98.4" y="27" width="1.6" height="6" fill="#e11d48" />
    </g>
  );
}

export function LaneSurface({ theme, lanes = 6 }: { theme: "track" | "pool"; lanes?: number }) {
  const fill = theme === "pool" ? "#3b82c4" : "#b5502f";
  const laneColor = theme === "pool" ? "#bfe0f5" : "#e8c9ad";
  const h = 60 / lanes;
  return (
    <g>
      <rect x="0" y="0" width="100" height="60" fill={fill} />
      {Array.from({ length: lanes - 1 }).map((_, i) => (
        <line key={i} x1="0" y1={(i + 1) * h} x2="100" y2={(i + 1) * h} stroke={laneColor} strokeWidth="0.35" />
      ))}
      {theme === "pool" ? (
        <rect x="0" y="0" width="4" height="60" fill="#1e3a5f" />
      ) : (
        <>
          <line x1="6" y1="0" x2="6" y2="60" stroke="white" strokeWidth="0.6" />
          <line x1="94" y1="0" x2="94" y2="60" stroke="white" strokeWidth="0.6" />
        </>
      )}
    </g>
  );
}
