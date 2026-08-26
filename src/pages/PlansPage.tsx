import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PracticePlan } from "../types";
import { loadPlans, savePlans } from "../lib/storage";
import { totalDurationSeconds } from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";
import { sportIcon } from "../lib/sportIcon";
import { newId } from "../lib/id";
import { ProgressRing } from "../components/ProgressRing";

export function PlansPage() {
  const [plans, setPlans] = useState<PracticePlan[]>(() => loadPlans());
  const navigate = useNavigate();

  function persist(next: PracticePlan[]) {
    setPlans(next);
    savePlans(next);
  }

  function createPlan() {
    const now = new Date().toISOString();
    const plan: PracticePlan = {
      id: newId(),
      name: "New Practice Plan",
      sport: "",
      targetMinutes: 60,
      notes: "",
      blocks: [],
      createdAt: now,
      updatedAt: now,
    };
    persist([...plans, plan]);
    navigate(`/plans/${plan.id}`);
  }

  function duplicatePlan(plan: PracticePlan) {
    const now = new Date().toISOString();
    const copy: PracticePlan = {
      ...plan,
      id: newId(),
      name: `${plan.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    persist([...plans, copy]);
  }

  function deletePlan(id: string) {
    if (!confirm("Delete this practice plan?")) return;
    persist(plans.filter((p) => p.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-8 flex-col sm:flex-row">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Practice Plans</h1>
          <p className="text-ink-dim text-sm mt-1">Build it once, run it right on time every time.</p>
        </div>
        <button onClick={createPlan} className="btn btn-primary">
          <span aria-hidden>+</span> New Plan
        </button>
      </div>

      {plans.length === 0 && (
        <div className="card p-10 text-center animate-in">
          <p className="text-4xl mb-3">🏟️</p>
          <h3 className="font-semibold text-ink mb-1">No practice plans yet</h3>
          <p className="text-sm text-ink-dim mb-4">Create your first plan to start building out today's session.</p>
          <button onClick={createPlan} className="btn btn-primary mx-auto">
            + New Plan
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const actualSeconds = totalDurationSeconds(plan.blocks);
          const actualMinutes = actualSeconds / 60;
          const overUnder = actualMinutes - plan.targetMinutes;
          const ringProgress = plan.targetMinutes > 0 ? actualMinutes / plan.targetMinutes : 0;
          const ringColor = overUnder > 0.5 ? "#ff5d75" : overUnder < -0.5 ? "#ffb545" : "#22e6a6";

          return (
            <div key={plan.id} className="card p-5 flex flex-col animate-in hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-xl">
                  {sportIcon(plan.sport)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink truncate">{plan.name}</h3>
                  <p className="text-xs text-ink-dim">{plan.sport || "No sport set"}</p>
                </div>
                <ProgressRing progress={ringProgress} size={44} strokeWidth={5} progressColor={ringColor}>
                  <span className="text-[10px] font-bold text-ink-dim">{Math.round(ringProgress * 100)}%</span>
                </ProgressRing>
              </div>

              <p className="text-sm text-ink-dim">
                <span className="font-semibold text-ink">{formatMinutesLabel(actualMinutes)}</span> planned ·{" "}
                {formatMinutesLabel(plan.targetMinutes)} target
              </p>
              {Math.abs(overUnder) >= 0.5 && (
                <p className={`text-xs mt-0.5 font-medium ${overUnder > 0 ? "text-danger" : "text-warn"}`}>
                  {overUnder > 0
                    ? `${formatMinutesLabel(overUnder)} over target`
                    : `${formatMinutesLabel(-overUnder)} under target`}
                </p>
              )}
              <p className="text-xs text-ink-faint mt-1">
                {plan.blocks.length} block{plan.blocks.length === 1 ? "" : "s"}
              </p>

              <Link to={`/run/${plan.id}`} className="btn btn-primary w-full mt-4">
                ▶ Run Practice
              </Link>
              <div className="flex gap-2 mt-2">
                <Link to={`/plans/${plan.id}`} className="btn btn-ghost flex-1 justify-center">
                  Edit
                </Link>
                <button onClick={() => duplicatePlan(plan)} className="btn btn-ghost flex-1 justify-center">
                  Duplicate
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  aria-label="Delete plan"
                  title="Delete plan"
                  className="btn btn-ghost text-danger/80 hover:text-danger hover:bg-danger-soft px-2.5"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
