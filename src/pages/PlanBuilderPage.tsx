import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Block, Drill, PracticePlan } from "../types";
import { loadDrills, loadPlans, savePlans } from "../lib/storage";
import { totalDurationSeconds, updateBlockInTree, removeBlockFromTree, moveBlockInTree, addChildToGroup } from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";
import { AddBlockButtons, BlockEditor } from "../components/BlockEditor";
import { TimelineStrip } from "../components/TimelineStrip";

export function PlanBuilderPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PracticePlan[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [plan, setPlan] = useState<PracticePlan | null>(null);
  const [saved, setSaved] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

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

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandOnly(id: string) {
    setExpanded((prev) => new Set(prev).add(id));
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
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-ink-dim">
        Plan not found.{" "}
        <button className="text-brand underline" onClick={() => navigate("/plans")}>
          Back to plans
        </button>
      </div>
    );
  }

  const actualSeconds = totalDurationSeconds(plan.blocks);
  const actualMinutes = actualSeconds / 60;
  const overUnder = actualMinutes - plan.targetMinutes;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28">
      <div className="flex items-center justify-between mb-5">
        <button className="btn btn-ghost !px-2" onClick={() => navigate("/plans")}>
          ← Back to plans
        </button>
        <button onClick={handlePersist} className="btn btn-primary">
          {saved ? "✓ Saved" : "Save Plan"}
        </button>
      </div>

      <div className="card p-5 mb-6">
        <label className="block mb-3">
          <span className="block text-xs font-semibold text-ink-dim mb-1">Plan Name</span>
          <input
            className="input font-display text-lg font-bold"
            value={plan.name}
            onChange={(e) => mutate((p) => ({ ...p, name: e.target.value }))}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold text-ink-dim mb-1">Sport</span>
            <input className="input" value={plan.sport} onChange={(e) => mutate((p) => ({ ...p, sport: e.target.value }))} />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-ink-dim mb-1">Target Length (minutes)</span>
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
          <span className="block text-xs font-semibold text-ink-dim mb-1">Notes</span>
          <textarea className="input min-h-16" value={plan.notes} onChange={(e) => mutate((p) => ({ ...p, notes: e.target.value }))} />
        </label>

        <div className="mt-5">
          <TimelineStrip blocks={plan.blocks} targetMinutes={plan.targetMinutes} />
          <div className="mt-2 flex items-center gap-3 text-sm flex-wrap">
            <span className="font-semibold text-ink">{formatMinutesLabel(actualMinutes)} planned</span>
            <span className="text-ink-faint">/ {formatMinutesLabel(plan.targetMinutes)} target</span>
            {Math.abs(overUnder) >= 0.5 && (
              <span className={`chip ${overUnder > 0 ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn"}`}>
                {overUnder > 0 ? `${formatMinutesLabel(overUnder)} over` : `${formatMinutesLabel(-overUnder)} under`}
              </span>
            )}
          </div>
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-ink mb-3">Practice Blocks</h2>

      {plan.blocks.length === 0 && (
        <p className="text-sm text-ink-dim mb-3">
          Add blocks to build your practice: single timed drills, repeating intervals (e.g. work/talk cycles), or groups of
          sequential stations. Tap a block to expand and edit it.
        </p>
      )}

      <BlockEditor
        blocks={plan.blocks}
        drills={drills}
        depth={0}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        onUpdate={(id, updater) => mutate((p) => ({ ...p, blocks: updateBlockInTree(p.blocks, id, updater) }))}
        onRemove={(id) => mutate((p) => ({ ...p, blocks: removeBlockFromTree(p.blocks, id) }))}
        onMove={(id, dir) => mutate((p) => ({ ...p, blocks: moveBlockInTree(p.blocks, id, dir) }))}
        onAddChild={(groupId, block) => {
          mutate((p) => ({ ...p, blocks: addChildToGroup(p.blocks, groupId, block) }));
          expandOnly(block.id);
        }}
      />

      <AddBlockButtons
        onAdd={(block: Block) => {
          mutate((p) => ({ ...p, blocks: [...p.blocks, block] }));
          expandOnly(block.id);
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-md border-t border-border py-3">
        <div className="mx-auto max-w-3xl px-4 flex items-center justify-between">
          <span className="text-sm text-ink-dim">{saved ? "All changes saved." : "You have unsaved changes."}</span>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/run/${plan.id}`)} className="btn btn-secondary">
              ▶ Run Practice
            </button>
            <button onClick={handlePersist} className="btn btn-primary">
              {saved ? "✓ Saved" : "Save Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
