import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? "bg-brand-soft text-brand" : "text-ink-dim hover:bg-surface-2 hover:text-ink"
  }`;

function LogoMark() {
  return (
    <svg viewBox="0 0 100 160" className="w-7 h-11" aria-hidden="true">
      <defs>
        <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#4f8cff" />
          <stop offset="0.55" stopColor="#a35bd6" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
      <path
        d="M 74,16 L 44,16 C 32,16 24,25 24,37 C 24,49 32,58 44,58 L 62,58 C 74,58 82,67 82,79 C 82,91 74,100 62,100 L 32,100"
        fill="none"
        stroke="url(#nav-logo-grad)"
        strokeWidth="16"
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
