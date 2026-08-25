import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PracticePlan } from "../types";
import { loadPlans, savePlans } from "../lib/storage";
import { totalDurationSeconds } from "../lib/blocks";
import { formatMinutesLabel } from "../lib/time";
import { newId } from "../lib/id";

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
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Practice Plans</h1>
        <button
          onClick={createPlan}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700"
        >
          + New Plan
        </button>
      </div>

      {plans.length === 0 && (
        <p className="text-slate-500 text-sm">No practice plans yet. Create one to get started.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const actualSeconds = totalDurationSeconds(plan.blocks);
          const actualMinutes = actualSeconds / 60;
          const overUnder = actualMinutes - plan.targetMinutes;
          return (
            <div key={plan.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm flex flex-col">
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500 mb-2">{plan.sport || "No sport set"}</p>
              <p className="text-sm text-slate-600">
                Target: {formatMinutesLabel(plan.targetMinutes)} · Planned: {formatMinutesLabel(actualMinutes)}
              </p>
              {Math.abs(overUnder) >= 0.5 && (
                <p className={`text-xs mt-1 ${overUnder > 0 ? "text-red-500" : "text-amber-600"}`}>
                  {overUnder > 0
                    ? `${formatMinutesLabel(overUnder)} over target`
                    : `${formatMinutesLabel(-overUnder)} under target`}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">{plan.blocks.length} block{plan.blocks.length === 1 ? "" : "s"}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  to={`/run/${plan.id}`}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700"
                >
                  Run Practice
                </Link>
                <Link
                  to={`/plans/${plan.id}`}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-xs hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => duplicatePlan(plan)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-xs hover:bg-slate-50"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-xs hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
