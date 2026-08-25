import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Block, Drill, PracticePlan } from "../types";
import { loadDrills, loadPlans, savePlans } from "../lib/storage";
import { totalDurationSeconds, updateBlockInTree, removeBlockFromTree, moveBlockInTree, addChildToGroup } from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";
import { AddBlockButtons, BlockEditor } from "../components/BlockEditor";

export function PlanBuilderPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PracticePlan[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [plan, setPlan] = useState<PracticePlan | null>(null);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const loadedPlans = loadPlans();
    setPlans(loadedPlans);
    setDrills(loadDrills());
    const found = loadedPlans.find((p) => p.id === planId);
    setPlan(found ?? null);
  }, [planId]);

  function mutate(fn: (p: PracticePlan) => PracticePlan) {
    setPlan((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      setSaved(false);
      return next;
    });
  }

  function handlePersist() {
    if (!plan) return;
    const updated = { ...plan, updatedAt: new Date().toISOString() };
    const next = plans.some((p) => p.id === updated.id)
      ? plans.map((p) => (p.id === updated.id ? updated : p))
      : [...plans, updated];
    savePlans(next);
    setPlans(next);
    setPlan(updated);
    setSaved(true);
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-slate-500">
        Plan not found. <button className="text-emerald-600 underline" onClick={() => navigate("/plans")}>Back to plans</button>
      </div>
    );
  }

  const actualSeconds = totalDurationSeconds(plan.blocks);
  const actualMinutes = actualSeconds / 60;
  const overUnder = actualMinutes - plan.targetMinutes;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button className="text-sm text-slate-500 hover:text-slate-700" onClick={() => navigate("/plans")}>
          ← Back to plans
        </button>
        <button
          onClick={handlePersist}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700"
        >
          {saved ? "Saved" : "Save Plan"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
        <label className="block mb-3">
          <span className="block text-xs font-medium text-slate-500 mb-1">Plan Name</span>
          <input
            className="input text-lg font-semibold"
            value={plan.name}
            onChange={(e) => mutate((p) => ({ ...p, name: e.target.value }))}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Sport</span>
            <input
              className="input"
              value={plan.sport}
              onChange={(e) => mutate((p) => ({ ...p, sport: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-500 mb-1">Target Length (minutes)</span>
            <input
              type="number"
              min={0}
              className="input"
              value={plan.targetMinutes}
              onChange={(e) => mutate((p) => ({ ...p, targetMinutes: Number(e.target.value) }))}
            />
          </label>
        </div>
        <label className="block mt-3">
          <span className="block text-xs font-medium text-slate-500 mb-1">Notes</span>
          <textarea
            className="input min-h-16"
            value={plan.notes}
            onChange={(e) => mutate((p) => ({ ...p, notes: e.target.value }))}
          />
        </label>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="font-medium text-slate-700">Planned: {formatMinutesLabel(actualMinutes)}</span>
          <span className="text-slate-400">/ Target: {formatMinutesLabel(plan.targetMinutes)}</span>
          {Math.abs(overUnder) >= 0.5 && (
            <span className={overUnder > 0 ? "text-red-500" : "text-amber-600"}>
              {overUnder > 0 ? `${formatMinutesLabel(overUnder)} over` : `${formatMinutesLabel(-overUnder)} under`}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3">Practice Blocks</h2>

      {plan.blocks.length === 0 && (
        <p className="text-sm text-slate-500 mb-3">
          Add blocks to build your practice: single timed drills, repeating intervals (e.g. work/talk cycles), or
          groups of sequential stations.
        </p>
      )}

      <BlockEditor
        blocks={plan.blocks}
        drills={drills}
        depth={0}
        onUpdate={(id, updater) => mutate((p) => ({ ...p, blocks: updateBlockInTree(p.blocks, id, updater) }))}
        onRemove={(id) => mutate((p) => ({ ...p, blocks: removeBlockFromTree(p.blocks, id) }))}
        onMove={(id, dir) => mutate((p) => ({ ...p, blocks: moveBlockInTree(p.blocks, id, dir) }))}
        onAddChild={(groupId, block) => mutate((p) => ({ ...p, blocks: addChildToGroup(p.blocks, groupId, block) }))}
      />

      <AddBlockButtons onAdd={(block: Block) => mutate((p) => ({ ...p, blocks: [...p.blocks, block] }))} />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3">
        <div className="mx-auto max-w-3xl px-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {saved ? "All changes saved." : "You have unsaved changes."}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/run/${plan.id}`)}
              className="px-4 py-2 border border-emerald-600 text-emerald-700 rounded-md text-sm font-semibold hover:bg-emerald-50"
            >
              Run Practice
            </button>
            <button
              onClick={handlePersist}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700"
            >
              {saved ? "Saved" : "Save Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
