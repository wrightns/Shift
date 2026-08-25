import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <span className="text-emerald-600">SportIT</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/plans" className={linkClass}>
            Practice Plans
          </NavLink>
          <NavLink to="/drills" className={linkClass}>
            Drill Bank
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
