import { useMemo, useState } from "react";
import type { Drill } from "../types";
import { loadDrills, saveDrills } from "../lib/storage";
import { newId } from "../lib/id";

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
  const [editing, setEditing] = useState<Drill | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drills;
    return drills.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.sport.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [drills, query]);

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
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Drill Bank</h1>
        <button
          onClick={startNew}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700"
        >
          + New Drill
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search drills by name, sport, category, or tag..."
        className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-slate-500 text-sm">No drills found.</p>}
          {filtered.map((drill) => (
            <div key={drill.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{drill.name}</h3>
                  <p className="text-xs text-slate-500">
                    {[drill.sport, drill.category].filter(Boolean).join(" · ")} · {drill.defaultMinutes} min
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(drill)}
                    className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDrill(drill.id)}
                    className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {drill.description && <p className="text-sm text-slate-600 mt-2">{drill.description}</p>}
              {drill.equipment && (
                <p className="text-xs text-slate-400 mt-2">Equipment: {drill.equipment}</p>
              )}
              {drill.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {drill.tags.map((t) => (
                    <span key={t} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          {editing ? (
            <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm sticky top-20">
              <h3 className="font-semibold mb-3">{isNew ? "New Drill" : "Edit Drill"}</h3>
              <div className="space-y-3">
                <Field label="Name">
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
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
                <button
                  onClick={saveEdit}
                  disabled={!editing.name.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400 text-sm">
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
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
