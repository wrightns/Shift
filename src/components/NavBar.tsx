import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? "bg-brand-soft text-brand" : "text-ink-dim hover:bg-surface-2 hover:text-ink"
  }`;

function LogoMark() {
  return (
    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-dim flex items-center justify-center shadow-sm shadow-brand/30">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#2b1400" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="13" r="7.5" />
        <path d="M12 13 L12 8.5" />
        <path d="M12 13 L15 13" />
        <path d="M10 2.5 L14 2.5" />
        <path d="M17.5 5 L16 6.5" />
      </svg>
    </span>
  );
}

export function NavBar() {
  return (
    <header className="border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display font-bold text-lg text-ink tracking-tight">Shift</span>
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
