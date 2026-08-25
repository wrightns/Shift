import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
  }`;

export function NavBar() {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-lg shadow-sm shadow-teal-600/30">
            ⚽
          </span>
          <span className="font-display font-bold text-lg text-slate-900 tracking-tight">SportIT</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/plans" className={linkClass}>
            <span aria-hidden>📋</span> Practice Plans
          </NavLink>
          <NavLink to="/drills" className={linkClass}>
            <span aria-hidden>🗂️</span> Drill Bank
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
