import type { Drill, PracticePlan } from "../types";
import { seedDrills, seedPlans } from "./seed";

const DRILLS_KEY = "sportit.drills.v1";
const PLANS_KEY = "sportit.plans.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — silently skip persistence.
  }
}

export function loadDrills(): Drill[] {
  const existing = localStorage.getItem(DRILLS_KEY);
  if (!existing) {
    save(DRILLS_KEY, seedDrills);
    return seedDrills;
  }
  return load<Drill[]>(DRILLS_KEY, seedDrills);
}

export function saveDrills(drills: Drill[]): void {
  save(DRILLS_KEY, drills);
}

export function loadPlans(): PracticePlan[] {
  const existing = localStorage.getItem(PLANS_KEY);
  if (!existing) {
    save(PLANS_KEY, seedPlans);
    return seedPlans;
  }
  return load<PracticePlan[]>(PLANS_KEY, seedPlans);
}

export function savePlans(plans: PracticePlan[]): void {
  save(PLANS_KEY, plans);
}
