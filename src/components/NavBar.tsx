import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? "bg-brand-soft text-brand" : "text-ink-dim hover:bg-surface-2 hover:text-ink"
  }`;

function LogoMark() {
  return (
    <svg viewBox="0 0 100 108" className="w-8 h-9" aria-hidden="true">
      <defs>
        <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#4f8cff" />
          <stop offset="0.55" stopColor="#a35bd6" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
      <path
        d="M 68,20 L 30,20 C 20,20 14,28 14,37 C 14,46 20,52 30,52 L 60,52 C 70,52 76,60 76,69 C 76,80 68,88 56,88 L 24,88"
        fill="none"
        stroke="url(#nav-logo-grad)"
        strokeWidth="17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavBar() {
  return (
    <header className="border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span
            className="text-2xl text-ink tracking-wide"
            style={{ fontFamily: "'Anton', sans-serif", transform: "skewX(-8deg)", display: "inline-block" }}
          >
            SHIFT
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/plans" className={linkClass}>
            Plans
          </NavLink>
          <NavLink to="/drills" className={linkClass}>
            Drills
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
