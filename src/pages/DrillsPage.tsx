import { useMemo, useState } from "react";
import type { Drill } from "../types";
import { loadDrills, saveDrills } from "../lib/storage";
import { newId } from "../lib/id";
import { sportIcon } from "../lib/sportIcon";
import { categoryChipColor } from "../lib/chipColor";
import { DrillDiagram } from "../components/diagram/DrillDiagram";

function emptyDrill(): Drill {
  return {
    id: newId(),
    name: "",
    sport: "",
    category: "",
    description: "",
    equipment: "",
    defaultMinutes: 10,
    tags: [],
  };
}

export function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>(() => loadDrills());
  const [query, setQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<Drill | null>(null);
  const [isNew, setIsNew] = useState(false);

  const sportCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const drill of drills) {
      if (!drill.sport) continue;
      counts.set(drill.sport, (counts.get(drill.sport) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [drills]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drills.filter((d) => {
      if (sportFilter && d.sport !== sportFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.sport.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [drills, query, sportFilter]);

  function persist(next: Drill[]) {
    setDrills(next);
    saveDrills(next);
  }

  function startNew() {
    setEditing(emptyDrill());
    setIsNew(true);
  }

  function startEdit(drill: Drill) {
    setEditing({ ...drill });
    setIsNew(false);
  }

  function cancelEdit() {
    setEditing(null);
    setIsNew(false);
  }

  function saveEdit() {
    if (!editing) return;
    if (!editing.name.trim()) return;
    const exists = drills.some((d) => d.id === editing.id);
    const next = exists ? drills.map((d) => (d.id === editing.id ? editing : d)) : [...drills, editing];
    persist(next);
    setEditing(null);
    setIsNew(false);
  }

  function deleteDrill(id: string) {
    if (!confirm("Delete this drill from the bank?")) return;
    persist(drills.filter((d) => d.id !== id));
    if (editing?.id === id) cancelEdit();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Drill Bank</h1>
          <p className="text-slate-500 text-sm mt-1">Your reusable library — pull any drill straight into a plan.</p>
        </div>
        <button onClick={startNew} className="btn btn-primary shrink-0">
          + New Drill
        </button>
      </div>

      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
          🔎
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search drills by name, sport, category, or tag..."
          className="input pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSportFilter(null)}
          className={`chip transition-colors ${
            sportFilter === null ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Sports ({drills.length})
        </button>
        {sportCounts.map(([sport, count]) => (
          <button
            key={sport}
            onClick={() => setSportFilter(sport === sportFilter ? null : sport)}
            className={`chip transition-colors ${
              sportFilter === sport ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {sportIcon(sport)} {sport} ({count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-slate-500 text-sm">No drills found.</p>}
          {filtered.map((drill) => {
            const chip = categoryChipColor(drill.category);
            return (
              <div
                key={drill.id}
                className={`card p-4 animate-in transition-shadow hover:shadow-md ${editing?.id === drill.id ? "ring-2 ring-teal-500" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">
                    {sportIcon(drill.sport)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 leading-tight">{drill.name}</h3>
                      <span className="text-xs font-semibold text-slate-500 shrink-0 tabular-nums">{drill.defaultMinutes} min</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {drill.category && (
                        <span className={`chip ${chip.bg} ${chip.text}`}>{drill.category}</span>
                      )}
                      {drill.sport && <span className="chip bg-slate-100 text-slate-600">{drill.sport}</span>}
                    </div>
                    {drill.description && <p className="text-sm text-slate-600 mt-2">{drill.description}</p>}
                    {drill.equipment && <p className="text-xs text-slate-400 mt-2">🎒 {drill.equipment}</p>}
                    {drill.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {drill.tags.map((t) => (
                          <span key={t} className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    {drill.diagram && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 max-w-xs">
                        <DrillDiagram sport={drill.sport} diagram={drill.diagram} className="w-full h-auto block" />
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => startEdit(drill)} className="btn btn-ghost !py-1 !px-2.5 text-xs">
                        Edit
                      </button>
                      <button onClick={() => deleteDrill(drill.id)} className="btn btn-ghost !py-1 !px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky top-20">
          {editing ? (
            <div className="card p-5 animate-in">
              <h3 className="font-semibold mb-3 text-slate-900">{isNew ? "New Drill" : "Edit Drill"}</h3>
              <div className="space-y-3">
                <Field label="Name">
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    autoFocus
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sport">
                    <input
                      className="input"
                      value={editing.sport}
                      onChange={(e) => setEditing({ ...editing, sport: e.target.value })}
                    />
                  </Field>
                  <Field label="Category">
                    <input
                      className="input"
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    className="input min-h-20"
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Equipment">
                    <input
                      className="input"
                      value={editing.equipment}
                      onChange={(e) => setEditing({ ...editing, equipment: e.target.value })}
                    />
                  </Field>
                  <Field label="Default Minutes">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={editing.defaultMinutes}
                      onChange={(e) => setEditing({ ...editing, defaultMinutes: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <Field label="Tags (comma separated)">
                  <input
                    className="input"
                    value={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveEdit} disabled={!editing.name.trim()} className="btn btn-primary">
                  Save Drill
                </button>
                <button onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
              Select a drill to edit, or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
